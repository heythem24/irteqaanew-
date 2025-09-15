import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Form, Modal, Row, Col, ProgressBar, Table } from 'react-bootstrap';
import { formatDate } from '../../utils/date';
import { MedicalService } from '../../services/medicalService';

interface TreatmentTrackerProps {
  athleteId: string;
  treatments: any[];
  onTreatmentUpdate: () => void;
}

const TreatmentTracker: React.FC<TreatmentTrackerProps> = ({ 
  athleteId, 
  treatments, 
  onTreatmentUpdate 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const [newTreatment, setNewTreatment] = useState<Partial<any>>({
    treatmentType: '',
    frequency: '',
    notes: '',
    startDate: new Date(),
    expectedDuration: 7, // days
    progress: 0
  });

  const [progressUpdate, setProgressUpdate] = useState({
    progress: 0,
    notes: '',
    date: new Date()
  });

  const [showProgressModal, setShowProgressModal] = useState(false);

  // Force periodic re-render so that "الأيام المتبقية" تتحدث تلقائياً
  const [nowTick, setNowTick] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60 * 1000); // كل دقيقة
    return () => clearInterval(id);
  }, []);

  const getTreatmentTypeLabel = (type: string) => {
    switch (type) {
      case 'physical_therapy': return 'علاج طبيعي';
      case 'medication': return 'علاج دوائي';
      case 'rest': return 'راحة';
      case 'surgery': return 'جراحة';
      case 'rehabilitation': return 'تأهيل';
      case 'heat_therapy': return 'علاج حراري';
      case 'cold_therapy': return 'علاج بالتبريد';
      case 'massage': return 'تدليك';
      default: return type;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  // احسب التقدّم والزمن ديناميكياً من التواريخ/المدة المتوقعة
  const computeDurationDays = (t: any) => {
    if (t.endDate) {
      const start = new Date(t.startDate as any);
      const end = new Date(t.endDate as any);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000*60*60*24)));
      }
    }
    return (typeof t.expectedDuration === 'number' && !isNaN(t.expectedDuration)) ? Math.max(1, t.expectedDuration) : 7;
  };

  const computeDaysSinceStart = (t: any, nowBase?: Date) => {
    const now = nowBase || new Date(nowTick);
    let start = new Date(t.startDate as any);
    if (isNaN(start.getTime())) start = new Date();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.floor((n.getTime() - s.getTime()) / (1000*60*60*24)));
  };

  const computeProgress = (t: any) => {
    const total = computeDurationDays(t);
    // إذا لدينا endDate في الماضي، فالتقدم 100%
    if (t.endDate) {
      const end = new Date(t.endDate as any);
      if (!isNaN(end.getTime()) && end.getTime() < Date.now()) return 100;
    }
    const daysDone = computeDaysSinceStart(t);
    const pct = Math.floor((daysDone / total) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  const getStatusBadge = (treatment: any) => {
    let start = new Date(treatment.startDate as any);
    if (isNaN(start.getTime())) start = new Date();
    const now = new Date(nowTick);
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const total = computeDurationDays(treatment);
    const endDay = new Date(s);
    endDay.setDate(s.getDate() + total);

    if (n.getTime() < s.getTime()) {
      return <Badge bg="secondary">لم يبدأ</Badge>;
    }
    if (n.getTime() >= endDay.getTime()) {
      return <Badge bg="success">مكتمل</Badge>;
    }
    return <Badge bg="warning">قيد التنفيذ</Badge>;
  };

  const handleSaveTreatment = () => {
    if (!athleteId || !newTreatment.treatmentType) return;
    
    const start = newTreatment.startDate || new Date();
    const exp = (typeof newTreatment.expectedDuration === 'number' && !isNaN(newTreatment.expectedDuration))
      ? newTreatment.expectedDuration
      : 7;
    const computedEnd = (() => {
      const d = new Date(start);
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() + exp);
      return d;
    })();

    const treatment = {
      id: selectedTreatment?.id || MedicalService.generateId(),
      athleteId: athleteId,
      injuryId: selectedTreatment?.injuryId || '',
      treatmentType: newTreatment.treatmentType || '',
      frequency: newTreatment.frequency || '',
      notes: newTreatment.notes || '',
      startDate: start,
      expectedDuration: exp,
      endDate: newTreatment.endDate || computedEnd,
      progress: newTreatment.progress || 0,
      progressHistory: selectedTreatment?.progressHistory || []
    };

    MedicalService.saveTreatment(treatment);
    
    // Create notification for athlete
    MedicalService.createAthleteNotification({
      athleteId: athleteId,
      type: 'NEW_TREATMENT',
      title: 'خطة علاج جديدة',
      message: `تم تحديد خطة علاج جديدة لك: ${getTreatmentTypeLabel(treatment.treatmentType)} بتكرار ${treatment.frequency}`,
      severity: 'MEDIUM'
    });
    
    onTreatmentUpdate();
    setShowModal(false);
    setSelectedTreatment(null);
    setNewTreatment({
      treatmentType: '',
      frequency: '',
      notes: '',
      startDate: new Date(),
      expectedDuration: 7,
      progress: 0
    });
  };

  const handleUpdateProgress = () => {
    if (!selectedTreatment) return;
    
    const updatedTreatment = {
      ...selectedTreatment,
      progress: progressUpdate.progress,
      progressHistory: [
        ...(selectedTreatment.progressHistory || []),
        {
          date: progressUpdate.date,
          progress: progressUpdate.progress,
          notes: progressUpdate.notes
        }
      ]
    };

    MedicalService.saveTreatment(updatedTreatment);
    onTreatmentUpdate();
    setShowProgressModal(false);
    setSelectedTreatment(null);
    setProgressUpdate({
      progress: 0,
      notes: '',
      date: new Date()
    });
  };

  const handleEditTreatment = (treatment: any) => {
    setSelectedTreatment(treatment);
    setNewTreatment({
      treatmentType: treatment.treatmentType,
      frequency: treatment.frequency,
      notes: treatment.notes,
      startDate: (() => {
        const d = new Date(treatment.startDate);
        return isNaN(d.getTime()) ? new Date() : d;
      })(),
      expectedDuration: treatment.expectedDuration,
      progress: treatment.progress
    });
    setShowModal(true);
  };

  const handleUpdateProgressClick = (treatment: any) => {
    setSelectedTreatment(treatment);
    setProgressUpdate({
      progress: treatment.progress,
      notes: '',
      date: new Date()
    });
    setShowProgressModal(true);
  };

  const handleDeleteTreatment = (treatmentId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العلاج؟')) {
      MedicalService.deleteTreatment(treatmentId, athleteId);
      onTreatmentUpdate();
    }
  };

  const calculateDaysRemaining = (treatment: any) => {
    try {
      const msPerDay = 1000 * 60 * 60 * 24;
      let start = new Date(treatment.startDate as any);
      if (isNaN(start.getTime())) start = new Date();
      const now = new Date(nowTick);
      // طبيع التاريخين إلى بداية اليوم لتفادي مشاكل المناطق الزمنية
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // إن وُجد endDate، استخدمه مباشرة
      if (treatment.endDate) {
        const end = new Date(treatment.endDate as any);
        if (!isNaN(end.getTime())) {
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
          const diff = Math.ceil((endDay.getTime() - nowDay.getTime()) / msPerDay);
          if (!import.meta.env.PROD) {
            console.debug('[RemainingDays][Staff] using endDate', { id: treatment.id, startDay, endDay, nowDay, diff });
          }
          return diff > 0 ? diff : 0;
        }
      }

      const expectedDuration = typeof treatment.expectedDuration === 'number' && !isNaN(treatment.expectedDuration)
        ? treatment.expectedDuration
        : 7;
      const daysSinceStart = Math.floor((nowDay.getTime() - startDay.getTime()) / msPerDay);
      const remaining = expectedDuration - daysSinceStart;
      if (!import.meta.env.PROD) {
        console.debug('[RemainingDays][Staff] using expectedDuration', { id: treatment.id, startDay, nowDay, expectedDuration, daysSinceStart, remaining });
      }
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  };

  const toDateInputValue = (d: any): string => {
    try {
      const date = d instanceof Date ? d : new Date(d);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const parseDateInput = (val: string): Date | null => {
    if (!val) return null;
    const dt = new Date(`${val}T00:00:00`);
    return isNaN(dt.getTime()) ? null : dt;
  };

  return (
    <div className="treatment-tracker">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">نظام تتبع العلاج</h5>
          <Button 
            variant="primary" 
            onClick={() => {
              setSelectedTreatment(null);
              setNewTreatment({
                treatmentType: '',
                frequency: '',
                notes: '',
                startDate: new Date(),
                expectedDuration: 7,
                progress: 0
              });
              setShowModal(true);
            }}
          >
            إضافة علاج جديد
          </Button>
        </Card.Header>
        <Card.Body>
          {treatments.length === 0 ? (
            <div className="text-center text-muted py-4">
              لا توجد علاجات مسجلة
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>نوع العلاج</th>
                  <th>التكرار</th>
                  <th>التقدم</th>
                  <th>الحالة</th>
                  <th>الأيام المتبقية</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment) => (
                  <tr key={treatment.id}>
                    <td>
                      <div>
                        <strong>{getTreatmentTypeLabel(treatment.treatmentType)}</strong>
                        {treatment.notes && (
                          <small className="text-muted d-block">{treatment.notes}</small>
                        )}
                      </div>
                    </td>
                    <td>{treatment.frequency}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <ProgressBar 
                          now={computeProgress(treatment)} 
                          variant={getProgressColor(computeProgress(treatment))}
                          style={{ width: '100px', height: '20px' }}
                          className="me-2"
                        />
                        <span>{computeProgress(treatment)}%</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(treatment)}</td>
                    <td
                      title={`start=${formatDate(treatment.startDate)}; end=${treatment.endDate ? formatDate(treatment.endDate) : '—'}; exp=${typeof treatment.expectedDuration === 'number' ? treatment.expectedDuration : '—'}; remaining=${calculateDaysRemaining(treatment)}`}
                    >
                      {calculateDaysRemaining(treatment)} يوم
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => handleEditTreatment(treatment)}
                        >
                          تعديل
                        </Button>
                        {/* التقدم أصبح ديناميكي؛ نخفي زر التحديث اليدوي */}
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDeleteTreatment(treatment.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Treatment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTreatment ? 'تعديل العلاج' : 'إضافة علاج جديد'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>نوع العلاج</Form.Label>
                  <Form.Select
                    value={newTreatment.treatmentType}
                    onChange={(e) => setNewTreatment({...newTreatment, treatmentType: e.target.value})}
                  >
                    <option value="">اختر نوع العلاج</option>
                    <option value="physical_therapy">علاج طبيعي</option>
                    <option value="medication">علاج دوائي</option>
                    <option value="rest">راحة</option>
                    <option value="surgery">جراحة</option>
                    <option value="rehabilitation">تأهيل</option>
                    <option value="heat_therapy">علاج حراري</option>
                    <option value="cold_therapy">علاج بالتبريد</option>
                    <option value="massage">تدليك</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>التكرار</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTreatment.frequency}
                    onChange={(e) => setNewTreatment({...newTreatment, frequency: e.target.value})}
                    placeholder="مثال: 3 مرات أسبوعياً، يومياً، إلخ"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>تاريخ البدء</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDateInputValue(newTreatment.startDate)}
                    onChange={(e) => setNewTreatment({...newTreatment, startDate: parseDateInput(e.target.value) || new Date()})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>المدة المتوقعة (أيام)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newTreatment.expectedDuration}
                    onChange={(e) => setNewTreatment({...newTreatment, expectedDuration: parseInt(e.target.value) || 7})}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>التقدم الحالي (%)</Form.Label>
              <Form.Control
                type="number"
                value={newTreatment.progress}
                onChange={(e) => setNewTreatment({...newTreatment, progress: parseInt(e.target.value) || 0})}
                min="0"
                max="100"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ملاحظات</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTreatment.notes}
                onChange={(e) => setNewTreatment({...newTreatment, notes: e.target.value})}
                placeholder="أي ملاحظات إضافية حول العلاج"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleSaveTreatment}>
            {selectedTreatment ? 'تحديث العلاج' : 'حفظ العلاج'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Progress Update Modal */}
      <Modal show={showProgressModal} onHide={() => setShowProgressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تحديث تقدم العلاج</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>نسبة التقدم (%)</Form.Label>
              <Form.Control
                type="number"
                value={progressUpdate.progress}
                onChange={(e) => setProgressUpdate({...progressUpdate, progress: parseInt(e.target.value) || 0})}
                min="0"
                max="100"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>التاريخ</Form.Label>
              <Form.Control
                type="date"
                value={toDateInputValue(progressUpdate.date)}
                onChange={(e) => setProgressUpdate({...progressUpdate, date: parseDateInput(e.target.value) || new Date()})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ملاحظات التقدم</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={progressUpdate.notes}
                onChange={(e) => setProgressUpdate({...progressUpdate, notes: e.target.value})}
                placeholder="ملاحظات حول التقدم المحرز"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProgressModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleUpdateProgress}>
            حفظ التحديث
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TreatmentTracker;