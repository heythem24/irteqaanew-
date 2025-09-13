import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { MedicalService } from '../../services/medicalService';
import type { MedicalAppointment } from '../../types/medical';

// Setup the localizer
const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  athleteId: string;
  appointments: MedicalAppointment[];
  onAppointmentUpdate: () => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ 
  athleteId, 
  appointments, 
  onAppointmentUpdate 
}) => {
const [showModal, setShowModal] = useState(false);
const [selectedAppointment, setSelectedAppointment] = useState<MedicalAppointment | null>(null);
const [newAppointment, setNewAppointment] = useState<Partial<MedicalAppointment>>({
  appointmentType: 'checkup',
  date: new Date(),
  time: '',
  location: '',
  doctorName: '',
  notes: '',
  status: 'scheduled'
});

const getAppointmentTypeLabel = (type: string) => {
  switch (type) {
    case 'checkup': return 'فحص دوري';
    case 'specialist': return 'استشاري';
    case 'imaging': return 'تصوير';
    case 'therapy': return 'علاج طبيعي';
    case 'followup': return 'متابعة';
    default: return type;
  }
};

// Convert appointments to calendar events
const events = appointments.map(appointment => {
  const appointmentDate = new Date(appointment.date);
  const [hours, minutes] = appointment.time.split(':').map(Number);
  appointmentDate.setHours(hours, minutes);
  
  const endDate = new Date(appointmentDate);
  endDate.setHours(appointmentDate.getHours() + 1); // Default 1 hour duration
  
  return {
    id: appointment.id,
    title: `${appointment.doctorName} - ${getAppointmentTypeLabel(appointment.appointmentType)}`,
    start: appointmentDate,
    end: endDate,
    resource: appointment
  };
});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    const startDate = new Date(slotInfo.start);
    setNewAppointment({
      appointmentType: 'checkup',
      date: startDate,
      time: startDate.toTimeString().substring(0, 5),
      location: '',
      doctorName: '',
      notes: '',
      status: 'scheduled'
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedAppointment(event.resource);
    setShowModal(true);
  };

  const saveAppointment = () => {
    if (!athleteId || !newAppointment.doctorName || !newAppointment.time) return;
    
    const appointment = {
      id: selectedAppointment?.id || MedicalService.generateId(),
      athleteId: athleteId,
      appointmentType: newAppointment.appointmentType as any,
      date: newAppointment.date || new Date(),
      time: newAppointment.time,
      location: newAppointment.location || '',
      doctorName: newAppointment.doctorName,
      notes: newAppointment.notes,
      status: newAppointment.status || 'scheduled'
    };

    MedicalService.saveAppointment(appointment);
    onAppointmentUpdate();
    setShowModal(false);
    setSelectedAppointment(null);
    setNewAppointment({
      appointmentType: 'checkup',
      date: new Date(),
      time: '',
      location: '',
      doctorName: '',
      notes: '',
      status: 'scheduled'
    });
  };

  const updateAppointmentStatus = (status: string) => {
    if (!selectedAppointment) return;
    
    MedicalService.updateAppointmentStatus(selectedAppointment.id, status, athleteId);
    onAppointmentUpdate();
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const deleteAppointment = () => {
    if (!selectedAppointment) return;
    
    MedicalService.deleteAppointment(selectedAppointment.id, athleteId);
    onAppointmentUpdate();
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const eventStyleGetter = (event: any) => {
    const backgroundColor = getStatusColor(event.resource.status);
    const style = {
      backgroundColor,
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  return (
    <div className="appointment-calendar">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">تقويم المواعيد الطبية</h5>
          <Button 
            variant="primary" 
            onClick={() => {
              setSelectedAppointment(null);
              setNewAppointment({
                appointmentType: 'checkup',
                date: new Date(),
                time: '',
                location: '',
                doctorName: '',
                notes: '',
                status: 'scheduled'
              });
              setShowModal(true);
            }}
          >
            إضافة موعد جديد
          </Button>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              messages={{
                today: 'اليوم',
                previous: 'السابق',
                next: 'التالي',
                month: 'شهر',
                week: 'أسبوع',
                day: 'يوم',
                agenda: 'جدول',
                date: 'تاريخ',
                time: 'وقت',
                event: 'موعد',
                noEventsInRange: 'لا توجد مواعيد في هذه الفترة'
              }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Appointment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAppointment ? 'تفاصيل الموعد' : 'إضافة موعد جديد'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>نوع الموعد</Form.Label>
                  <Form.Select
                    value={newAppointment.appointmentType}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentType: e.target.value as any})}
                    disabled={selectedAppointment?.status === 'completed'}
                  >
                    <option value="checkup">فحص دوري</option>
                    <option value="specialist">استشاري</option>
                    <option value="imaging">تصوير</option>
                    <option value="therapy">علاج طبيعي</option>
                    <option value="followup">متابعة</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الحالة</Form.Label>
                  <Form.Select
                    value={newAppointment.status}
                    onChange={(e) => setNewAppointment({...newAppointment, status: e.target.value as 'scheduled' | 'completed' | 'cancelled'})}
                  >
                    <option value="scheduled">مجدول</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغى</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>التاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    value={newAppointment.date ? newAppointment.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewAppointment({...newAppointment, date: new Date(e.target.value)})}
                    disabled={selectedAppointment?.status === 'completed'}
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
                    disabled={selectedAppointment?.status === 'completed'}
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
                disabled={selectedAppointment?.status === 'completed'}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>اسم الطبيب</Form.Label>
              <Form.Control
                type="text"
                value={newAppointment.doctorName || ''}
                onChange={(e) => setNewAppointment({...newAppointment, doctorName: e.target.value})}
                placeholder="اسم الطبيب أو المختص"
                disabled={selectedAppointment?.status === 'completed'}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          {selectedAppointment && (
            <>
              {selectedAppointment.status !== 'completed' && (
                <Button 
                  variant="success" 
                  onClick={() => updateAppointmentStatus('completed')}
                >
                  تحديد كمكتمل
                </Button>
              )}
              <Button 
                variant="danger" 
                onClick={deleteAppointment}
              >
                حذف الموعد
              </Button>
            </>
          )}
          <Button variant="primary" onClick={saveAppointment}>
            {selectedAppointment ? 'تحديث الموعد' : 'حفظ الموعد'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;