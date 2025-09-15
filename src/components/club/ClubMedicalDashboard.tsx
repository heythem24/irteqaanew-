import React, { useEffect, useMemo, useState } from 'react';
import { formatDate, formatDateTime } from '../../utils/date';
import { Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Tabs, Tab, Form, Modal, Table } from 'react-bootstrap';
import { MedicalService } from '../../services/medicalService';
import { UsersService as UserService } from '../../services/firestoreService';
import type { User } from '../../types';
import type {
  DailyWellness,
  InjuryRecord,
  WellnessAlert,
  WellnessReport,
  MedicalProfile,
  Treatment,
  MedicalAppointment,
} from '../../types/medical';
import { InjuryStatus, AlertSeverity } from '../../types/medical';
import AppointmentCalendar from './AppointmentCalendar';
import TreatmentTracker from './TreatmentTracker';
import './MedicalDashboard.css';
import MedicalCharts from '../athlete/MedicalCharts';

export interface ClubMedicalDashboardProps {
  clubId: string;
}

const ClubMedicalDashboard: React.FC<ClubMedicalDashboardProps> = ({ clubId }) => {
  // Check if user is logged in and has medical staff role
  const currentUser = UserService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'medical_staff') {
    return <Navigate to="/login" replace />;
  }

  const navigate = useNavigate();

  const handleLogout = () => {
    UserService.logout();
    navigate('/login');
  };

  // Load club athletes from Firestore (users collection with role = 'athlete')
  const [clubAthletes, setClubAthletes] = useState<User[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingAthletes(true);
        const athletes = await UserService.getAthletesByClub(clubId);
        if (mounted) setClubAthletes(athletes);
      } catch (e) {
        console.error('Failed to load club athletes for medical dashboard:', e);
        if (mounted) setClubAthletes([]);
      } finally {
        if (mounted) setLoadingAthletes(false);
      }
    })();
    return () => { mounted = false; };
  }, [clubId]);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');

  // Data states
  const [wellness, setWellness] = useState<DailyWellness[]>([]);
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  const [alerts, setAlerts] = useState<WellnessAlert[]>([]);
  const [report, setReport] = useState<WellnessReport | null>(null);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [staffNotifications, setStaffNotifications] = useState<any[]>([]);

  // Helper: get athlete full name by id
  const getAthleteName = (athleteId: string) => {
    const a = clubAthletes.find(u => u.id === athleteId);
    if (!a) return '';
    const first = (a.firstNameAr || a.firstName || a.username || '').trim();
    const last = (a.lastNameAr || a.lastName || '').trim();
    return `${first} ${last}`.trim();
  };

  // Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Form states
  const [newAppointment, setNewAppointment] = useState<Partial<MedicalAppointment>>({
    appointmentType: 'checkup',
    date: new Date(),
    time: '',
    location: '',
    doctorName: '',
    notes: ''
  });
  const [profileForm, setProfileForm] = useState<Partial<MedicalProfile>>({
    bloodType: '',
    allergies: [],
    medicalConditions: [],
    medications: []
  });
  // Text inputs for multiline fields; convert to arrays only on save
  const [allergiesText, setAllergiesText] = useState<string>('');
  const [medicalConditionsText, setMedicalConditionsText] = useState<string>('');
  const [medicationsText, setMedicationsText] = useState<string>('');

  const refreshAthleteData = async (athleteId: string) => {
    if (!athleteId) return;
    try {
      // Async Firestore-backed data
      const [wellnessData, reportData, profileData] = await Promise.all([
        MedicalService.getDailyWellness(athleteId),
        MedicalService.generateWellnessReport(athleteId, 30),
        MedicalService.getMedicalProfile(athleteId)
      ]);
      setWellness(wellnessData);
      setReport(reportData);
      setMedicalProfile(profileData);

      // Injuries & alerts
      const injuriesData = await MedicalService.getInjuryRecords(athleteId);
      setInjuries(injuriesData);
      setAlerts(MedicalService.getAlerts(athleteId));
      const treatmentsData = await MedicalService.getTreatments(athleteId);
      setTreatments(treatmentsData);
      const appts = await MedicalService.getAppointments(athleteId);
      setAppointments(appts);
      setStaffNotifications(MedicalService.getStaffNotifications(clubId)); // Using clubId from props
    } catch (e) {
      console.error('Failed to refresh athlete medical data:', e);
    }
  };


  const saveAppointment = async () => {
    if (!selectedAthleteId || !newAppointment.doctorName || !newAppointment.time) return;
    
    const appointment = {
      id: MedicalService.generateId(),
      athleteId: selectedAthleteId,
      appointmentType: newAppointment.appointmentType as any,
      date: newAppointment.date || new Date(),
      time: newAppointment.time,
      location: newAppointment.location || '',
      doctorName: newAppointment.doctorName,
      notes: newAppointment.notes,
      status: 'scheduled'
    };

    await MedicalService.saveAppointment(appointment);
    const updated = await MedicalService.getAppointments(selectedAthleteId);
    setAppointments(updated);
    
    // Create notification for athlete
    MedicalService.createAthleteNotification({
      athleteId: selectedAthleteId,
      type: 'NEW_APPOINTMENT',
      title: 'موعد طبي جديد',
      message: `تم تحديد موعد طبي جديد لك: ${appointment.appointmentType} مع ${appointment.doctorName} في ${appointment.location}`,
      severity: 'MEDIUM'
    });
    
    setNewAppointment({
      appointmentType: 'checkup',
      date: new Date(),
      time: '',
      location: '',
      doctorName: '',
      notes: ''
    });
    setShowAppointmentModal(false);
  };

  const saveMedicalProfile = () => {
    if (!selectedAthleteId) return;
    
    const profile: MedicalProfile = {
      athleteId: selectedAthleteId,
      bloodType: profileForm.bloodType,
      allergies: (allergiesText || '')
        .split('\n')
        .map(a => a.trim())
        .filter(Boolean),
      medicalConditions: (medicalConditionsText || '')
        .split('\n')
        .map(a => a.trim())
        .filter(Boolean),
      medications: (medicationsText || '')
        .split('\n')
        .map(a => a.trim())
        .filter(Boolean),
      updatedAt: new Date()
    };

    MedicalService.saveMedicalProfile(profile);
    setMedicalProfile(profile);
    
    // Create notification for athlete
    MedicalService.createAthleteNotification({
      athleteId: selectedAthleteId,
      type: 'PROFILE_UPDATED',
      title: 'تحديث الملف الطبي',
      message: 'تم تحديث ملفك الطبي من قبل الطاقم الطبي',
      severity: 'LOW'
    });
    
    setShowProfileModal(false);
  };

  // Initialize textareas when opening the modal
  useEffect(() => {
    if (showProfileModal) {
      const src = medicalProfile || (profileForm as any);
      setAllergiesText((src.allergies || []).join('\n'));
      setMedicalConditionsText((src.medicalConditions || []).join('\n'));
      setMedicationsText((src.medications || []).join('\n'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProfileModal]);

  const getInjuryStatusColor = (status: InjuryStatus) => {
    switch (status) {
      case InjuryStatus.ACTIVE: return 'danger';
      case InjuryStatus.RECOVERING: return 'warning';
      case InjuryStatus.RECOVERED: return 'success';
      case InjuryStatus.CHRONIC: return 'secondary';
      default: return 'primary';
    }
  };

  const getAlertSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'danger';
      case AlertSeverity.HIGH: return 'warning';
      case AlertSeverity.MEDIUM: return 'info';
      case AlertSeverity.LOW: return 'secondary';
      default: return 'primary';
    }
  };

  const getWellnessScoreColor = (score: number) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'warning';
    return 'danger';
  };

  // Load on mount and when selection changes
  useEffect(() => {
    if (!selectedAthleteId && clubAthletes.length > 0) {
      setSelectedAthleteId((clubAthletes[0] as any)?.id || '');
      return;
    }
    refreshAthleteData(selectedAthleteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAthleteId, clubAthletes.length > 0 ? clubAthletes.map((a: any) => a.id).join('|') : '']);

  // Real-time updates via event
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ athleteId?: string; source: string }>;
      if (!selectedAthleteId) return;
      if (!ce.detail || !ce.detail.athleteId || ce.detail.athleteId === selectedAthleteId) {
        refreshAthleteData(selectedAthleteId);
      }
    };
    window.addEventListener('medicalDataUpdated' as any, handler as any);
    return () => window.removeEventListener('medicalDataUpdated' as any, handler as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAthleteId]);

  // Calculate statistics for overview
  const activeInjuriesCount = injuries.filter(i =>
    i.status === InjuryStatus.ACTIVE || i.status === InjuryStatus.RECOVERING
  ).length;
  
  const highAlertsCount = alerts.filter(a =>
    a.severity === AlertSeverity.HIGH || a.severity === AlertSeverity.CRITICAL
  ).length;

  const unreadNotificationsCount = staffNotifications.filter(n => !n.read).length;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col md={10}>
          <h2>لوحة الطاقم الطبي</h2>
          <p className="text-muted">إدارة الصحة والعلاج للرياضيين في النادي</p>
        </Col>
        <Col md={2} className="text-end">
          <Button variant="outline-danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>
            خروج
          </Button>
        </Col>
      </Row>

      {/* Athlete Selection */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>اختيار الرياضي:</Form.Label>
            <Form.Select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
            >
              {clubAthletes.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {`${(a.firstNameAr || a.firstName || a.username || '').trim()} ${(a.lastNameAr || a.lastName || '').trim()}`.trim()}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end">
          <Button
            variant="primary"
            onClick={() => setShowProfileModal(true)}
            disabled={!selectedAthleteId}
          >
            تحديث الملف الطبي
          </Button>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-4">
        <Tab eventKey="overview" title="نظرة عامة">
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h5>الرياضيون</h5>
                  <h2 className="text-primary">{clubAthletes.length}</h2>
                  <small className="text-muted">في النادي</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h5>الإصابات النشطة</h5>
                  <h2 className={activeInjuriesCount > 0 ? 'text-warning' : 'text-success'}>
                    {activeInjuriesCount}
                  </h2>
                  <small className="text-muted">تحت المتابعة</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h5>التنبيهات العاجلة</h5>
                  <h2 className={highAlertsCount > 0 ? 'text-danger' : 'text-success'}>
                    {highAlertsCount}
                  </h2>
                  <small className="text-muted">تتطلب الانتباه</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h5>الإشعارات</h5>
                  <h2 className={unreadNotificationsCount > 0 ? 'text-warning' : 'text-success'}>
                    {unreadNotificationsCount}
                  </h2>
                  <small className="text-muted">إشعارات غير مقروءة</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Alerts */}
          {highAlertsCount > 0 && (
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">التنبيهات العاجلة</h5>
                  </Card.Header>
                  <Card.Body>
                    {alerts.filter(a => a.severity === AlertSeverity.HIGH || a.severity === AlertSeverity.CRITICAL).map((alert) => (
                      <Alert key={alert.id} variant={getAlertSeverityColor(alert.severity)} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{alert.type}</strong>
                            <div>{alert.message}</div>
                          </div>
                          <small className="text-muted">
                            {formatDate(alert.triggeredDate)}
                          </small>
                        </div>
                      </Alert>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Recent Wellness Scores */}
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">آخر تقييمات الصحة</h5>
                </Card.Header>
                <Card.Body>
                  {wellness.length > 0 ? (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>الاسم واللقب</th>
                          <th>التاريخ</th>
                          <th>مؤشر الصحة</th>
                          <th>جودة النوم</th>
                          <th>مستوى التعب</th>
                          <th>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wellness.slice(0, 5).map((w) => (
                          <tr key={w.id}>
                            <td>{getAthleteName(w.athleteId)}</td>
                            <td>{formatDate(w.date)}</td>
                            <td>
                              <Badge bg={getWellnessScoreColor(w.wellnessScore)}>
                                {w.wellnessScore.toFixed(1)}
                              </Badge>
                            </td>
                            <td>{w.sleepQuality}/5</td>
                            <td>{w.fatigueLevel}/5</td>
                            <td>{w.additionalNotes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted">
                      لا توجد بيانات تقييم صحة متاحة
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="wellness" title="الرفاهية اليومية">
          <Card>
            <Card.Header>
              <h5 className="mb-0">سجل الرفاهية اليومية</h5>
            </Card.Header>
            <Card.Body>
              {wellness.length === 0 ? (
                <div className="text-center text-muted py-4">
                  لا توجد بيانات رفاهية مسجلة
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>الاسم واللقب</th>
                        <th>التاريخ</th>
                        <th>مؤشر الصحة</th>
                        <th>جودة النوم</th>
                        <th>مستوى التعب</th>
                        <th>آلام العضلات</th>
                        <th>مستوى التوتر</th>
                        <th>المزاج</th>
                        <th>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wellness.map((w) => (
                        <tr key={w.id}>
                          <td>{getAthleteName(w.athleteId)}</td>
                          <td>{formatDate(w.date)}</td>
                          <td>
                            <Badge bg={getWellnessScoreColor(w.wellnessScore)}>
                              {w.wellnessScore.toFixed(1)}
                            </Badge>
                          </td>
                          <td>{w.sleepQuality}/5</td>
                          <td>{w.fatigueLevel}/5</td>
                          <td>{w.muscleSoreness}/5</td>
                          <td>{w.stressLevel}/5</td>
                          <td>{w.mood}/5</td>
                          <td>{w.additionalNotes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <MedicalCharts type="wellness" data={wellness} />
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="injuries" title="الإصابات">
          <Card>
            <Card.Header>
              <h5 className="mb-0">سجل الإصابات</h5>
            </Card.Header>
            <Card.Body>
              {injuries.length === 0 ? (
                <div className="text-center text-muted py-4">
                  لا توجد إصابات مسجلة
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>موقع الإصابة</th>
                        <th>نوع الإصابة</th>
                        <th>مستوى الألم</th>
                        <th>الحالة</th>
                        <th>تاريخ الإبلاغ</th>
                        <th>ملاحظات العلاج</th>
                      </tr>
                    </thead>
                    <tbody>
                      {injuries.map((injury) => (
                        <tr key={injury.id}>
                          <td>{injury.injuryLocation}</td>
                          <td>{injury.injuryType}</td>
                          <td>{injury.painLevel}/10</td>
                          <td>
                            <Badge bg={getInjuryStatusColor(injury.status)}>
                              {injury.status === InjuryStatus.ACTIVE ? 'نشطة' :
                               injury.status === InjuryStatus.RECOVERING ? 'قيد الشفاء' :
                               injury.status === InjuryStatus.RECOVERED ? 'تم الشفاء' : 'مزمنة'}
                            </Badge>
                          </td>
                          <td>{formatDate(injury.reportDate)}</td>
                          <td>{injury.treatmentNotes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <MedicalCharts type="injuries" data={injuries} />
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="treatments" title="العلاجات">
          {selectedAthleteId && (
            <>
              <TreatmentTracker
                athleteId={selectedAthleteId}
                treatments={treatments}
                onTreatmentUpdate={() => refreshAthleteData(selectedAthleteId)}
              />
              {treatments.length > 0 && (
                <div className="mt-3">
                  <MedicalCharts type="treatments" data={treatments} />
                </div>
              )}
            </>
          )}
        </Tab>

        <Tab eventKey="appointments" title="المواعيد">
          <Tabs defaultActiveKey="list" id="appointment-tabs" className="mb-3">
            <Tab eventKey="list" title="قائمة المواعيد">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">المواعيد الطبية</h5>
                  <Button
                    variant="primary"
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    إضافة موعد جديد
                  </Button>
                </Card.Header>
                <Card.Body>
                  {appointments.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      لا توجد مواعيد مسجلة
                    </div>
                  ) : (
                    <>
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>نوع الموعد</th>
                            <th>التاريخ</th>
                            <th>الوقت</th>
                            <th>الموقع</th>
                            <th>الطبيب</th>
                            <th>الحالة</th>
                            <th>ملاحظات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appointment) => (
                            <tr key={appointment.id}>
                              <td>
                                {appointment.appointmentType === 'checkup' ? 'فحص دوري' :
                                 appointment.appointmentType === 'specialist' ? 'استشاري' :
                                 appointment.appointmentType === 'imaging' ? 'تصوير' :
                                 appointment.appointmentType === 'therapy' ? 'علاج طبيعي' :
                                 appointment.appointmentType === 'followup' ? 'متابعة' : appointment.appointmentType}
                              </td>
                              <td>{formatDate(appointment.date)}</td>
                              <td>{appointment.time}</td>
                              <td>{appointment.location}</td>
                              <td>{appointment.doctorName}</td>
                              <td>
                                <Badge bg={
                                  appointment.status === 'scheduled' ? 'primary' :
                                  appointment.status === 'completed' ? 'success' : 'danger'
                                }>
                                  {appointment.status === 'scheduled' ? 'مجدول' :
                                   appointment.status === 'completed' ? 'مكتمل' : 'ملغى'}
                                </Badge>
                              </td>
                              <td>{appointment.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <MedicalCharts type="appointments" data={appointments} />
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="calendar" title="التقويم">
              {selectedAthleteId && (
                <AppointmentCalendar
                  athleteId={selectedAthleteId}
                  appointments={appointments}
                  onAppointmentUpdate={() => refreshAthleteData(selectedAthleteId)}
                />
              )}
            </Tab>
          </Tabs>
        </Tab>

        <Tab eventKey="alerts" title="التنبيهات">
          <Card>
            <Card.Header>
              <h5 className="mb-0">نظام التنبيهات الصحية</h5>
            </Card.Header>
            <Card.Body>
              {alerts.length === 0 ? (
                <div className="text-center text-muted py-4">
                  لا توجد تنبيهات
                </div>
              ) : (
                <div className="alert-list">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} variant={getAlertSeverityColor(alert.severity)} className="mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="alert-heading">{alert.type}</h6>
                          <p className="mb-1">{alert.message}</p>
                          <small className="text-muted">{formatDateTime(alert.triggeredDate)}</small>
                        </div>
                        <Badge bg={getAlertSeverityColor(alert.severity)}>
                          {alert.severity === AlertSeverity.CRITICAL ? 'عاجل' :
                           alert.severity === AlertSeverity.HIGH ? 'عالي' :
                           alert.severity === AlertSeverity.MEDIUM ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="profiles" title="الملفات الطبية">
          <Card>
            <Card.Header>
              <h5 className="mb-0">الملف الطبي للرياضي</h5>
            </Card.Header>
            <Card.Body>
              {medicalProfile ? (
                <div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <h6>فصيلة الدم:</h6>
                      <p>{medicalProfile.bloodType || 'غير محدد'}</p>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <h6>الحساسية:</h6>
                      {medicalProfile.allergies && medicalProfile.allergies.length > 0 ? (
                        <ul>
                          {medicalProfile.allergies.map((allergy, index) => (
                            <li key={index}>{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">لا توجد حساسية مسجلة</p>
                      )}
                    </Col>
                    <Col md={6}>
                      <h6>الحالات الطبية:</h6>
                      {medicalProfile.medicalConditions && medicalProfile.medicalConditions.length > 0 ? (
                        <ul>
                          {medicalProfile.medicalConditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">لا توجد حالات طبية مسجلة</p>
                      )}
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={12}>
                      <h6>الأدوية الحالية:</h6>
                      {medicalProfile.medications && medicalProfile.medications.length > 0 ? (
                        <ul>
                          {medicalProfile.medications.map((medication, index) => (
                            <li key={index}>{medication}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">لا توجد أدوية مسجلة</p>
                      )}
                    </Col>
                  </Row>
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      آخر تحديث: {medicalProfile.updatedAt ? formatDateTime(medicalProfile.updatedAt) : 'غير محدد'}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  لا يوجد ملف طبي مسجل لهذا الرياضي
                  <div className="mt-3">
                    <Button variant="primary" onClick={() => setShowProfileModal(true)}>
                      إنشاء ملف طبي
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="reports" title="التقارير">
          <Card>
            <Card.Header>
              <h5 className="mb-0">تقرير الصحة الشامل (30 يوم)</h5>
            </Card.Header>
            <Card.Body>
              {report ? (
                <div>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Card className="text-center">
                        <Card.Body>
                          <h5>متوسط مؤشر الصحة</h5>
                          <h2 className={`text-${getWellnessScoreColor(report.averageWellnessScore)}`}>
                            {report.averageWellnessScore.toFixed(1)}
                          </h2>
                          <small>من 5.0</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="text-center">
                        <Card.Body>
                          <h5>اتجاه الصحة</h5>
                          <h2 className={
                            report.wellnessTrend === 'improving' ? 'text-success' :
                            report.wellnessTrend === 'declining' ? 'text-danger' : 'text-warning'
                          }>
                            {report.wellnessTrend === 'improving' ? 'محسن' :
                             report.wellnessTrend === 'declining' ? 'متراجع' : 'مستقر'}
                          </h2>
                          <small>خلال الـ 30 يوم الماضية</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row className="mb-4">
                    <Col>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">التوصيات الصحية</h6>
                        </Card.Header>
                        <Card.Body>
                          {report.recommendations.length > 0 ? (
                            <ul>
                              {report.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">لا توجد توصيات حالية</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">التنبيهات المسجلة</h6>
                        </Card.Header>
                        <Card.Body>
                          {report.alerts.length > 0 ? (
                            <div className="alert-list">
                              {report.alerts.map((alert, index) => (
                                <Alert key={index} variant={getAlertSeverityColor(alert.severity)} className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <strong>{alert.type}</strong>
                                      <div>{alert.message}</div>
                                    </div>
                                    <small className="text-muted">{formatDate(alert.triggeredDate)}</small>
                                  </div>
                                </Alert>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">لا توجد تنبيهات مسجلة خلال هذه الفترة</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  لا توجد بيانات كافية لإنشاء تقرير
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="notifications" title="الإشعارات">
          <Card>
            <Card.Header>
              <h5 className="mb-0">إشعارات الطاقم الطبي</h5>
            </Card.Header>
            <Card.Body>
              {staffNotifications.length === 0 ? (
                <div className="text-center text-muted py-4">
                  لا توجد إشعارات
                </div>
              ) : (
                <div className="notification-list">
                  {staffNotifications.map((notification) => (
                    <Alert
                      key={notification.id}
                      variant={notification.severity === 'HIGH' || notification.severity === 'CRITICAL' ? 'danger' :
                              notification.severity === 'MEDIUM' ? 'warning' : 'info'}
                      className={`mb-3 ${!notification.read ? 'border-2 border-primary' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="alert-heading">{notification.title}</h6>
                          <p className="mb-1">{notification.message}</p>
                          <small className="text-muted">{formatDateTime(notification.timestamp)}</small>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <Badge bg={
                            notification.severity === 'CRITICAL' ? 'danger' :
                            notification.severity === 'HIGH' ? 'warning' :
                            notification.severity === 'MEDIUM' ? 'info' : 'secondary'
                          }>
                            {notification.severity === 'CRITICAL' ? 'عاجل' :
                             notification.severity === 'HIGH' ? 'عالي' :
                             notification.severity === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                          </Badge>
                          {!notification.read && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                MedicalService.markNotificationAsRead(notification.id);
                                setStaffNotifications(MedicalService.getStaffNotifications('club-1'));
                              }}
                            >
                              تحديد كمقروء
                            </Button>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>


      {/* Appointment Modal */}
      <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة موعد جديد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>نوع الموعد</Form.Label>
              <Form.Select
                value={newAppointment.appointmentType}
                onChange={(e) => setNewAppointment({...newAppointment, appointmentType: e.target.value as any})}
              >
                <option value="checkup">فحص دوري</option>
                <option value="specialist">استشاري</option>
                <option value="imaging">تصوير</option>
                <option value="therapy">علاج طبيعي</option>
                <option value="followup">متابعة</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>التاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    value={newAppointment.date ? newAppointment.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewAppointment({...newAppointment, date: new Date(e.target.value)})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الوقت</Form.Label>
                  <Form.Control
                    type="time"
                    value={newAppointment.time || ''}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>الموقع</Form.Label>
              <Form.Control
                type="text"
                value={newAppointment.location || ''}
                onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                placeholder="مثال: المستشفى، العيادة، إلخ"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>اسم الطبيب</Form.Label>
              <Form.Control
                type="text"
                value={newAppointment.doctorName || ''}
                onChange={(e) => setNewAppointment({...newAppointment, doctorName: e.target.value})}
                placeholder="اسم الطبيب أو المختص"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ملاحظات</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newAppointment.notes || ''}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="أي ملاحظات إضافية حول الموعد"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAppointmentModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={saveAppointment}>
            حفظ الموعد
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Medical Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تحديث الملف الطبي</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>فصيلة الدم</Form.Label>
              <Form.Select
                value={profileForm.bloodType || ''}
                onChange={(e) => setProfileForm({...profileForm, bloodType: e.target.value})}
              >
                <option value="">اختر فصيلة الدم</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الحساسية</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="اكتب كل بند في سطر منفصل (يمكنك كتابة جملة كاملة لكل بند)"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الحالات الطبية</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={medicalConditionsText}
                onChange={(e) => setMedicalConditionsText(e.target.value)}
                placeholder="اكتب كل حالة في سطر منفصل (يمكنك كتابة جملة كاملة لكل بند)"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الأدوية الحالية</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="اكتب كل دواء في سطر منفصل (يمكنك كتابة جملة كاملة لكل بند)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={saveMedicalProfile}>
            حفظ الملف الطبي
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="text-center text-muted mt-4">
        <small>
          يتم تحديث البيانات بشكل فوري عند إدخالها من قبل الرياضيين
        </small>
      </div>
    </Container>
  );
};

export default ClubMedicalDashboard;
