import React, { useState } from 'react';
import { Card, Button, Badge, Form, Modal, Row, Col, ProgressBar, Table } from 'react-bootstrap';
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

  const getStatusBadge = (treatment: any) => {
    if (treatment.progress >= 100) {
      return <Badge bg="success">مكتمل</Badge>;
    } else if (treatment.progress > 0) {
      return <Badge bg="warning">قيد التنفيذ</Badge>;
    } else {
      return <Badge bg="secondary">لم يبدأ</Badge>;
    }
  };

  const handleSaveTreatment = () => {
    if (!athleteId || !newTreatment.treatmentType) return;
    
    const treatment = {
      id: selectedTreatment?.id || MedicalService.generateId(),
      athleteId: athleteId,
      injuryId: selectedTreatment?.injuryId || '',
      treatmentType: newTreatment.treatmentType || '',
      frequency: newTreatment.frequency || '',
      notes: newTreatment.notes || '',
      startDate: newTreatment.startDate || new Date(),
      expectedDuration: newTreatment.expectedDuration || 7,
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
    const startDate = new Date(treatment.startDate);
    const expectedDuration = treatment.expectedDuration || 7;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + expectedDuration);
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
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
                          now={treatment.progress} 
                          variant={getProgressColor(treatment.progress)}
                          style={{ width: '100px', height: '20px' }}
                          className="me-2"
                        />
                        <span>{treatment.progress}%</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(treatment)}</td>
                    <td>{calculateDaysRemaining(treatment)} يوم</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => handleEditTreatment(treatment)}
                        >
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-success"
                          onClick={() => handleUpdateProgressClick(treatment)}
                          disabled={treatment.progress >= 100}
                        >
                          تحديث التقدم
                        </Button>
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