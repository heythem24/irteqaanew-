import React, { useState, useEffect } from 'react';
import { formatDate, formatTime } from '../../utils/date';
import { Navigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Tabs, Tab, Table } from 'react-bootstrap';
import './MedicalDashboard.css';
import type {
  DailyWellness,
  InjuryRecord,
  WellnessAlert,
  WellnessReport,
  MedicalProfile,
  MedicalAppointment,
  Treatment
} from '../../types/medical';
import {
  InjuryStatus,
  AlertSeverity
} from '../../types/medical';
import { MedicalService } from '../../services/medicalService';
import { UsersService as UserService } from '../../services/firestoreService';
import DailyWellnessForm from './DailyWellnessForm';
import InjuryReportForm from './InjuryReportForm';
import WellnessChart from './WellnessChart';
import MedicalCharts from './MedicalCharts';

interface Props {
  athleteId: string;
  athleteName: string;
}

const AthleteMedicalDashboard: React.FC<Props> = ({ athleteId, athleteName }) => {
  // Check if user is logged in and has athlete role
  const currentUser = UserService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'athlete') {
    return <Navigate to="/login" replace />;
  }

  const [todayWellness, setTodayWellness] = useState<DailyWellness | null>(null);
  const [recentWellness, setRecentWellness] = useState<DailyWellness[]>([]);
  const [activeInjuries, setActiveInjuries] = useState<InjuryRecord[]>([]);
  const [alerts, setAlerts] = useState<WellnessAlert[]>([]);
  const [wellnessReport, setWellnessReport] = useState<WellnessReport | null>(null);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [staffNotifications, setStaffNotifications] = useState<any[]>([]);
  // tick to force periodic refresh of computed fields like remaining days
  const [nowTick, setNowTick] = useState<number>(Date.now());
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showWellnessForm, setShowWellnessForm] = useState(false);
  const [showInjuryForm, setShowInjuryForm] = useState(false);
  // Profile is read-only for athletes; no modal needed

  const loadDashboardData = async () => {
    try {
      // تحديد تاريخ اليوم
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // الحصول على بيانات اليوم
      const todaysWellness = await MedicalService.getDailyWellness(athleteId, today, today);
      setTodayWellness(todaysWellness[0] || null);
      
      // الحصول على بيانات آخر 30 يوم
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentData = await MedicalService.getDailyWellness(athleteId, thirtyDaysAgo);
      setRecentWellness(recentData);
      
      // الحصول على الإصابات النشطة (Firestore)
      const allInjuries = await MedicalService.getInjuryRecords(athleteId);
      const active = allInjuries.filter((injury: InjuryRecord) =>
        injury.status === InjuryStatus.ACTIVE || injury.status === InjuryStatus.RECOVERING
      );
      setActiveInjuries(active);
      
      // الحصول على التنبيهات
      const recentAlerts = MedicalService.getAlerts(athleteId).slice(0, 5);
      setAlerts(recentAlerts);
      
      // إنشاء تقرير الصحة
      const report = await MedicalService.generateWellnessReport(athleteId, 30);
      setWellnessReport(report);
      
      // الحصول على الملف الطبي
      const profile = await MedicalService.getMedicalProfile(athleteId);
      setMedicalProfile(profile);
      
      // الحصول على المواعيد الطبية (Firestore)
      const appts = await MedicalService.getAppointments(athleteId);
      setAppointments(appts);
      
      // الحصول على العلاجات (Firestore)
      const treatmentsData = await MedicalService.getTreatments(athleteId);
      setTreatments(treatmentsData);
      
      // الحصول على إشعارات الطاقم الطبي
      setStaffNotifications(MedicalService.getAthleteNotifications(athleteId));
      
      // Create staff notification for new injury if reported
      if (active.length > 0) {
        const latestInjury = active[0];
        const now = new Date();
        const injuryDate = new Date(latestInjury.reportDate);
        const hoursSinceInjury = (now.getTime() - injuryDate.getTime()) / (1000 * 60 * 60);
        
        // Only create notification if injury was reported in the last 24 hours
        if (hoursSinceInjury < 24) {
          MedicalService.createStaffNotification({
            clubId: 'club-1', // This should be dynamically determined
            type: 'NEW_INJURY',
            title: 'إصابة جديدة',
            message: `تم الإبلاغ عن إصابة جديدة للرياضي: ${latestInjury.injuryLocation}`,
            severity: latestInjury.painLevel >= 7 ? 'HIGH' : 'MEDIUM',
            athleteId: athleteId,
            injuryId: latestInjury.id
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // helper to compute remaining days for treatments
  const calculateDaysRemaining = (t: Treatment) => {
    try {
      const msPerDay = 1000 * 60 * 60 * 24;
      const start = new Date(t.startDate as any);
      if (isNaN(start.getTime())) return '-';
      const now = new Date(nowTick);
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (t.endDate) {
        const end = new Date(t.endDate as any);
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const diff = Math.ceil((endDay.getTime() - nowDay.getTime()) / msPerDay);
        if (!import.meta.env.PROD) {
          console.debug('[RemainingDays][Athlete] using endDate', { id: (t as any).id, startDay, endDay, nowDay, diff });
        }
        return (diff > 0 ? diff : 0) + ' يوم';
      }

      const expectedDuration = (t as any).expectedDuration;
      const durationDays = (typeof expectedDuration === 'number' && !isNaN(expectedDuration)) ? expectedDuration : 7;
      const daysSinceStart = Math.floor((nowDay.getTime() - startDay.getTime()) / msPerDay);
      const remaining = durationDays - daysSinceStart;
      if (!import.meta.env.PROD) {
        console.debug('[RemainingDays][Athlete] using expectedDuration', { id: (t as any).id, startDay, nowDay, durationDays, daysSinceStart, remaining });
      }
      return (remaining > 0 ? remaining : 0) + ' يوم';
    } catch {
      return '-';
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [athleteId]);

  // periodic tick each minute to re-render and recalc remaining days
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Refresh when other parts of the app update medical data (e.g., staff creates an appointment)
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ athleteId?: string; source: string }>;
      if (!ce.detail) return;
      // Refresh if update is for this athlete or global
      if (!ce.detail.athleteId || ce.detail.athleteId === athleteId) {
        loadDashboardData();
      }
    };
    window.addEventListener('medicalDataUpdated' as any, handler as any);
    return () => window.removeEventListener('medicalDataUpdated' as any, handler as any);
  }, [athleteId]);

  const handleWellnessSubmit = (wellness: DailyWellness) => {
    MedicalService.saveDailyWellness(wellness);
    setShowWellnessForm(false);
    loadDashboardData();
  };

  const handleInjurySubmit = async (injury: InjuryRecord) => {
    await MedicalService.saveInjuryRecord(injury);
    setShowInjuryForm(false);
    loadDashboardData();
  };

  const getWellnessScoreColor = (score: number) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'warning';
    return 'danger';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➖';
    }
  };

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return '🚨';
      case AlertSeverity.HIGH: return '⚠️';
      case AlertSeverity.MEDIUM: return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>المركز الصحي - {athleteName}</h2>
          <p className="text-muted">تتبع صحتك وأدائك يومياً</p>
        </Col>
      </Row>

      {/* الإحصائيات الرئيسية */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h5>مؤشر الصحة اليومي</h5>
              <h2 className={`text-${getWellnessScoreColor(todayWellness?.wellnessScore || 0)}`}>
                {todayWellness ? todayWellness.wellnessScore.toFixed(1) : '--'}
              </h2>
              <small className="text-muted">من 5.0</small>
              {!todayWellness && (
                <div className="mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowWellnessForm(true)}
                  >
                    سجل حالتك اليوم
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h5>متوسط الصحة (30 يوم)</h5>
              <h2 className={`text-${getWellnessScoreColor(wellnessReport?.averageWellnessScore || 0)}`}>
                {wellnessReport?.averageWellnessScore ? wellnessReport.averageWellnessScore.toFixed(1) : '--'}
              </h2>
              <div>
                {wellnessReport && (
                  <span>
                    {getTrendIcon(wellnessReport.wellnessTrend)} {
                      wellnessReport.wellnessTrend === 'improving' ? 'محسن' :
                      wellnessReport.wellnessTrend === 'declining' ? 'متراجع' : 'مستقر'
                    }
                  </span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h5>الإصابات النشطة</h5>
              <h2 className={activeInjuries.length > 0 ? 'text-warning' : 'text-success'}>
                {activeInjuries.length}
              </h2>
              <small className="text-muted">
                {activeInjuries.length > 0 ? 'تحتاج متابعة' : 'لا توجد إصابات'}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h5>التنبيهات</h5>
              <h2 className={alerts.length > 0 ? 'text-danger' : 'text-success'}>
                {alerts.length}
              </h2>
              <small className="text-muted">تنبيهات جديدة</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* التبويبات */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-0">
                <Tab eventKey="overview" title="نظرة عامة" />
                <Tab eventKey="wellness" title="الرفاهية اليومية" />
                <Tab eventKey="injuries" title="الإصابات" />
                <Tab eventKey="profile" title="الملف الطبي" />
                <Tab eventKey="appointments" title="المواعيد" />
                <Tab eventKey="treatments" title="العلاجات" />
                <Tab eventKey="reports" title="التقارير" />
                <Tab eventKey="notifications" title="الإشعارات" />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {/* تبويب النظرة العامة */}
              {activeTab === 'overview' && (
                <Row>
                  <Col lg={8}>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">مؤشر الصحة - آخر 30 يوم</h5>
                      </Card.Header>
                      <Card.Body>
                        <WellnessChart data={recentWellness} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={4}>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">التنبيهات الأخيرة</h5>
                      </Card.Header>
                      <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {alerts.length === 0 ? (
                          <div className="text-center text-muted">
                            <p>لا توجد تنبيهات</p>
                            <small>هذا شيء جيد! 😊</small>
                          </div>
                        ) : (
                          alerts.map((alert, index) => (
                            <Alert
                              key={index}
                              variant={
                                alert.severity === AlertSeverity.HIGH || alert.severity === AlertSeverity.CRITICAL
                                  ? 'danger'
                                  : alert.severity === AlertSeverity.MEDIUM
                                  ? 'warning'
                                  : 'info'
                              }
                              className="py-2"
                            >
                              <div className="d-flex align-items-center">
                                <span className="me-2">{getAlertIcon(alert.severity)}</span>
                                <div className="flex-grow-1">
                                  <small className="fw-bold d-block">{alert.message}</small>
                                  <small className="text-muted">{formatDate(alert.triggeredDate)}</small>
                                </div>
                              </div>
                            </Alert>
                          ))
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب الرفاهية اليومية */}
              {activeTab === 'wellness' && (
                <Row>
                  <Col md={12}>
                    <Card className="mb-3">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">الرفاهية اليومية</h5>
                        <Button variant="primary" onClick={() => setShowWellnessForm(true)}>
                          تسجيل الرفاهية اليومية
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <WellnessChart data={recentWellness} />
                        <MedicalCharts type="wellness" data={recentWellness} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب الإصابات */}
              {activeTab === 'injuries' && (
                <Row>
                  <Col md={12}>
                    <Card className="mb-3">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">الإصابات</h5>
                        <Button variant="warning" onClick={() => setShowInjuryForm(true)}>
                          الإبلاغ عن إصابة جديدة
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        {activeInjuries.length === 0 ? (
                          <div className="text-center text-muted">
                            <p>لا توجد إصابات نشطة</p>
                            <small>هذا شيء جيد! 😊</small>
                          </div>
                        ) : (
                          <Row>
                            {activeInjuries.map((injury) => (
                              <Col md={6} key={injury.id} className="mb-3">
                                <Card className="border-warning">
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6>{injury.injuryLocation}</h6>
                                        <p className="mb-1">
                                          <small>مستوى الألم: {injury.painLevel}/10</small>
                                        </p>
                                        <p className="mb-1">
                                          <small>التاريخ: {formatDate(injury.reportDate)}</small>
                                        </p>
                                      </div>
                                      <Badge
                                        bg={injury.status === InjuryStatus.ACTIVE ? 'danger' : 'warning'}
                                      >
                                        {injury.status === InjuryStatus.ACTIVE ? 'نشطة' : 'قيد الشفاء'}
                                      </Badge>
                                    </div>
                                    {injury.expectedReturnDate && (
                                      <small className="text-muted">العودة المتوقعة: {formatDate(injury.expectedReturnDate)}</small>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب الملف الطبي */}
              {activeTab === 'profile' && (
                <Row>
                  <Col>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">الملف الطبي</h5>
                      </Card.Header>
                      <Card.Body>
                        {medicalProfile ? (
                          <Row>
                            <Col md={6}>
                              <h6>معلومات أساسية</h6>
                              <p><strong>فصيلة الدم:</strong> {medicalProfile.bloodType || 'غير محدد'}</p>
                            </Col>
                            <Col md={6}>
                              <h6>الحساسية</h6>
                              {medicalProfile.allergies && medicalProfile.allergies.length > 0 ? (
                                <ul className="mb-0">
                                  {medicalProfile.allergies.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted mb-0">لا توجد حساسية مسجلة</p>
                              )}
                            </Col>
                            <Col md={6}>
                              <h6>الحالات الطبية</h6>
                              {medicalProfile.medicalConditions && medicalProfile.medicalConditions.length > 0 ? (
                                <ul className="mb-0">
                                  {medicalProfile.medicalConditions.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted mb-0">لا توجد حالات طبية مسجلة</p>
                              )}
                            </Col>
                            <Col md={6}>
                              <h6>الأدوية الحالية</h6>
                              {medicalProfile.medications && medicalProfile.medications.length > 0 ? (
                                <ul className="mb-0">
                                  {medicalProfile.medications.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted mb-0">لا توجد أدوية مسجلة</p>
                              )}
                            </Col>
                          </Row>
                        ) : (
                          <div className="text-center text-muted">لا يوجد ملف طبي مسجل</div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب المواعيد */}
              {activeTab === 'appointments' && (
                <Row>
                  <Col>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">المواعيد الطبية</h5>
                      </Card.Header>
                      <Card.Body>
                        {appointments.length === 0 ? (
                          <div className="text-center text-muted">
                            <p>لا توجد مواعيد طبية مسجلة</p>
                            <small>سيتم إضافة المواعيد من قبل الطاقم الطبي</small>
                          </div>
                        ) : (
                          <>
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>التاريخ</th>
                                  <th>الوقت</th>
                                  <th>النوع</th>
                                  <th>الموقع</th>
                                  <th>الطبيب</th>
                                  <th>الحالة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {appointments.map((appointment) => (
                                  <tr key={appointment.id}>
                                    <td>{formatDate(appointment.date)}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.appointmentType}</td>
                                    <td>{appointment.location}</td>
                                    <td>{appointment.doctorName}</td>
                                    <td>
                                      <Badge
                                        bg={
                                          appointment.status === 'scheduled' ? 'primary' :
                                          appointment.status === 'completed' ? 'success' :
                                          appointment.status === 'cancelled' ? 'danger' : 'secondary'
                                        }
                                      >
                                        {appointment.status === 'scheduled' ? 'مجدول' :
                                         appointment.status === 'completed' ? 'مكتمل' :
                                         appointment.status === 'cancelled' ? 'ملغي' : appointment.status}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                            <MedicalCharts type="appointments" data={appointments} />
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب العلاجات */}
              {activeTab === 'treatments' && (
                <Row>
                  <Col>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">خطط العلاج</h5>
                      </Card.Header>
                      <Card.Body>
                        {treatments.length === 0 ? (
                          <div className="text-center text-muted">
                            <p>لا توجد خطط علاج مسجلة</p>
                            <small>سيتم إضافة خطط العلاج من قبل الطاقم الطبي</small>
                          </div>
                        ) : (
                          <>
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>نوع العلاج</th>
                                  <th>تاريخ البدء</th>
                                  <th>التكرار</th>
                                  <th>الحالة</th>
                                  <th>الأيام المتبقية</th>
                                  <th>ملاحظات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {treatments.map((treatment) => (
                                  <tr key={treatment.id}>
                                    <td>{treatment.treatmentType}</td>
                                    <td>{formatDate(treatment.startDate)}</td>
                                    <td>{treatment.frequency}</td>
                                    <td>
                                      {(() => {
                                        // ديناميكية الحالة حسب الزمن
                                        const msPerDay = 1000 * 60 * 60 * 24;
                                        const now = new Date(nowTick);
                                        let start = new Date(treatment.startDate as any);
                                        if (isNaN(start.getTime())) start = new Date();
                                        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                                        const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                        // احسب مدة العلاج
                                        let total: number;
                                        if (treatment.endDate) {
                                          const e0 = new Date(treatment.endDate as any);
                                          const e = new Date(e0.getFullYear(), e0.getMonth(), e0.getDate());
                                          total = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / msPerDay));
                                        } else {
                                          const exp = (treatment as any).expectedDuration;
                                          total = (typeof exp === 'number' && !isNaN(exp)) ? Math.max(1, exp) : 7;
                                        }
                                        const endDay = new Date(s);
                                        endDay.setDate(s.getDate() + total);
                                        if (n.getTime() < s.getTime()) {
                                          return <Badge bg="secondary">لم يبدأ</Badge>;
                                        }
                                        if (n.getTime() >= endDay.getTime()) {
                                          return <Badge bg="success">مكتمل</Badge>;
                                        }
                                        return <Badge bg="warning">قيد التنفيذ</Badge>;
                                      })()}
                                    </td>
                                    <td>{calculateDaysRemaining(treatment)}</td>
                                    <td>{treatment.notes || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                            <MedicalCharts type="treatments" data={treatments} />
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب التقارير */}
              {activeTab === 'reports' && (
                <Row>
                  <Col>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">التقارير الصحية</h5>
                      </Card.Header>
                      <Card.Body>
                        {wellnessReport ? (
                          <div>
                            <Row className="mb-4">
                              <Col md={6}>
                                <Card>
                                  <Card.Body className="text-center">
                                    <h5>متوسط مؤشر الصحة</h5>
                                    <h2 className={`text-${getWellnessScoreColor(wellnessReport.averageWellnessScore)}`}>
                                      {wellnessReport.averageWellnessScore.toFixed(1)}
                                    </h2>
                                    <small>من 5.0</small>
                                  </Card.Body>
                                </Card>
                              </Col>
                              <Col md={6}>
                                <Card>
                                  <Card.Body className="text-center">
                                    <h5>اتجاه الصحة</h5>
                                    <h2>
                                      {getTrendIcon(wellnessReport.wellnessTrend)} {
                                        wellnessReport.wellnessTrend === 'improving' ? 'محسن' :
                                        wellnessReport.wellnessTrend === 'declining' ? 'متراجع' : 'مستقر'
                                      }
                                    </h2>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>
                            <Card>
                              <Card.Header>
                                <h5 className="mb-0">التوصيات الصحية</h5>
                              </Card.Header>
                              <Card.Body>
                                <ul className="list-unstyled mb-0">
                                  {wellnessReport.recommendations.map((rec, index) => (
                                    <li key={index} className="mb-2">
                                      <span className="text-primary">•</span> {rec}
                                    </li>
                                  ))}
                                </ul>
                              </Card.Body>
                            </Card>
                          </div>
                        ) : (
                          <div className="text-center text-muted">
                            <p>لا توجد بيانات كافية لإنشاء تقرير</p>
                            <small>يرجى تسجيل بيانات الرفاهية اليومية لإنشاء تقارير صحية</small>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* تبويب الإشعارات */}
              {activeTab === 'notifications' && (
                <Row>
                  <Col>
                    <Card className="mb-3">
                      <Card.Header>
                        <h5 className="mb-0">إشعارات الطاقم الطبي</h5>
                      </Card.Header>
                      <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {staffNotifications.length === 0 ? (
                          <div className="text-center text-muted">
                            <p>لا توجد إشعارات من الطاقم الطبي</p>
                            <small>سيتم عرض الإشعارات هنا عند توفرها</small>
                          </div>
                        ) : (
                          staffNotifications.map((notification) => (
                            <Alert
                              key={notification.id}
                              variant={
                                notification.severity === 'HIGH' || notification.severity === 'CRITICAL'
                                  ? 'danger'
                                  : notification.severity === 'MEDIUM'
                                  ? 'warning'
                                  : 'info'
                              }
                              className="py-2"
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <small className="fw-bold d-block">{notification.title}</small>
                                  <small>{notification.message}</small>
                                  <div className="mt-1">
                                    <small className="text-muted">
                                      {formatDate(notification.timestamp)} {formatTime(notification.timestamp)}
                                    </small>
                                  </div>
                                </div>
                                {!notification.read && (
                                  <Badge bg="primary">جديد</Badge>
                                )}
                              </div>
                            </Alert>
                          ))
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Forms */}
      {showWellnessForm && (
        <DailyWellnessForm
          athleteId={athleteId}
          onSubmit={handleWellnessSubmit}
          onCancel={() => setShowWellnessForm(false)}
        />
      )}

      {showInjuryForm && (
        <InjuryReportForm
          athleteId={athleteId}
          onSubmit={handleInjurySubmit}
          onCancel={() => setShowInjuryForm(false)}
        />
      )}

      {/* No profile editing modal for athletes (read-only) */}
    </Container>
  );
};

export default AthleteMedicalDashboard;
