import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface Attendee {
  id: number;
  order: string;
  name: string;
  position: string;
  signature: string;
}

interface ResolutionItem {
  id: number;
  text: string;
}

const MeetingMinutes: React.FC = () => {
  const [formData, setFormData] = useState({
    associationName: '',
    wilaya: 'سطيف',
    meetingDate: '',
    meetingTime: '',
    year: new Date().getFullYear().toString(),
    meetingPlace: '',
    presider: '',
    generalSecretary: '',
    resolutionDate: '',
    resolutionPlace: ''
  });

  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: 1, order: '1', name: '', position: '', signature: '' }
  ]);

  const [resolutions, setResolutions] = useState<ResolutionItem[]>([
    { id: 1, text: '' },
    { id: 2, text: '' },
    { id: 3, text: '' },
    { id: 4, text: '' },
    { id: 5, text: '' },
    { id: 6, text: '' }
  ]);

  const [implementers, setImplementers] = useState('');

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateAttendee = (id: number, field: keyof Attendee, value: string) => {
    setAttendees(attendees.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAttendee = () => {
    const newOrder = (Math.max(...attendees.map(a => parseInt(a.order) || 0)) + 1).toString();
    setAttendees([...attendees, { id: Date.now(), order: newOrder, name: '', position: '', signature: '' }]);
  };

  const removeAttendee = (id: number) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter(a => a.id !== id));
    }
  };

  const updateResolution = (id: number, text: string) => {
    setResolutions(resolutions.map(r => r.id === id ? { ...r, text } : r));
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-file-alt me-3"></i>
          مستخرج مداولة
        </h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* الترويسة */}
          <div className="text-center mb-4 p-3 bg-light rounded">
            <h5 className="text-primary mb-2">الجمهورية الجزائرية الديمقراطية الشعبية</h5>
            <h6 className="text-secondary">ولاية {formData.wilaya}</h6>
          </div>

          {/* معلومات المداولة */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات المداولة</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تعيين الجمعية:</Form.Label>
                    <Form.Control
                      value={formData.associationName}
                      onChange={(e) => updateForm('associationName', e.target.value)}
                      placeholder="أدخل اسم الجمعية"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>بتاريخ:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => updateForm('meetingDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>جلسة يوم:</Form.Label>
                    <Form.Control
                      value={formData.meetingDate}
                      onChange={(e) => updateForm('meetingDate', e.target.value)}
                      type="date"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>على الساعة:</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => updateForm('meetingTime', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>سنة ألفين:</Form.Label>
                    <Form.Control
                      value={formData.year}
                      onChange={(e) => updateForm('year', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>مقر الاجتماع:</Form.Label>
                    <Form.Control
                      value={formData.meetingPlace}
                      onChange={(e) => updateForm('meetingPlace', e.target.value)}
                      placeholder="أدخل مقر الاجتماع"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تحت إشراف السيد:</Form.Label>
                    <Form.Control
                      value={formData.presider}
                      onChange={(e) => updateForm('presider', e.target.value)}
                      placeholder="أدخل اسم الرئيس"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* جدول الحضور */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">الحاضرون</h5>
              <Button variant="light" size="sm" onClick={addAttendee}>
                <i className="fas fa-plus me-1"></i> إضافة حاضر
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered hover responsive className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '60px' }}>الترتيب</th>
                    <th>الاسم واللقب</th>
                    <th>الصفة</th>
                    <th style={{ width: '100px' }}>الإمضاء</th>
                    <th style={{ width: '60px' }}>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td>
                        <Form.Control
                          value={attendee.order}
                          onChange={(e) => updateAttendee(attendee.id, 'order', e.target.value)}
                          size="sm"
                          readOnly
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={attendee.name}
                          onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                          size="sm"
                          placeholder="الاسم واللقب"
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={attendee.position}
                          onChange={(e) => updateAttendee(attendee.id, 'position', e.target.value)}
                          size="sm"
                          placeholder="الصفة"
                        />
                      </td>
                      <td style={{ border: '2px dashed #ccc', borderRadius: '4px' }}></td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeAttendee(attendee.id)}
                          disabled={attendees.length === 1}
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

          {/* موضوع المداولة */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">موضوع المداولة واللوائح المصادق عليها</h5>
            </Card.Header>
            <Card.Body>
              {resolutions.map((resolution) => (
                <Form.Group key={resolution.id} className="mb-3">
                  <Form.Label>{resolution.id}-</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={resolution.text}
                    onChange={(e) => updateResolution(resolution.id, e.target.value)}
                    placeholder="أدخل موضوع المداولة"
                  />
                </Form.Group>
              ))}
            </Card.Body>
          </Card>

          {/* التنفيذ */}
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">التنفيذ</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>وقد كلف السادة:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={implementers}
                  onChange={(e) => setImplementers(e.target.value)}
                  placeholder="أدخل أسماء المكلفين بتنفيذ المداولة"
                />
              </Form.Group>
              <Form.Text className="text-muted">
                بتنفيذ محتوى هذه المداولة كل واحد حسب اختصاصه
              </Form.Text>
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>في:</Form.Label>
                    <Form.Control
                      value={formData.resolutionPlace}
                      onChange={(e) => updateForm('resolutionPlace', e.target.value)}
                      placeholder="المدينة"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>بتاريخ:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.resolutionDate}
                      onChange={(e) => updateForm('resolutionDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">الكاتب العام</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MeetingMinutes;
