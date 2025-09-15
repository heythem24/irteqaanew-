import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import type { Injury, BodyPart } from '../../types/medical';

interface Props {
  athleteId: string;
  onSubmit: (injury: Injury) => void;
  onCancel: () => void;
}

// استخدم قيماً داخلية (بالإنجليزية) مطابقة للنوع BodyPart، واعرض تسميات عربية للمستخدم
const bodyPartOptions: { value: BodyPart; label: string }[] = [
  { value: 'head', label: 'رأس' },
  { value: 'neck', label: 'رقبة' },
  { value: 'shoulder', label: 'كتف' },
  { value: 'elbow', label: 'مرفق' },
  { value: 'wrist', label: 'معصم' },
  { value: 'hand', label: 'يد' },
  { value: 'chest', label: 'صدر' },
  { value: 'back', label: 'ظهر' },
  { value: 'abdomen', label: 'بطن' },
  { value: 'hip', label: 'ورك' },
  { value: 'thigh', label: 'فخذ' },
  { value: 'knee', label: 'ركبة' },
  { value: 'calf', label: 'عضلة الساق' },
  { value: 'ankle', label: 'كاحل' },
  { value: 'foot', label: 'قدم' }
];

const InjuryReportForm: React.FC<Props> = ({ athleteId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<{ injuryLocation: string; bodyPart: BodyPart; painLevel: number; howItHappened: string; reportDate: string }>({
    injuryLocation: '',
    bodyPart: bodyPartOptions[0].value,
    painLevel: 5,
    howItHappened: '',
    reportDate: new Date().toISOString().split('T')[0]
  });

  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.injuryLocation.trim() || !formData.howItHappened.trim() || !formData.reportDate) {
      setShowAlert(true);
      return;
    }

    const injuryRecord: Injury = {
      id: Date.now().toString(),
      athleteId,
      injuryLocation: formData.bodyPart,
      injuryType: formData.injuryLocation,
      severity: formData.painLevel >= 7 ? 'severe' : formData.painLevel >= 4 ? 'moderate' : 'mild',
      status: 'active',
      painLevel: formData.painLevel,
      reportDate: new Date(`${formData.reportDate}T00:00:00`),
      treatmentNotes: formData.howItHappened
    };

    onSubmit(injuryRecord);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'painLevel' ? parseInt(value) : value
    }));
  };

  return (
    <Modal show onHide={onCancel} size="lg" dir="rtl">
      <Modal.Header closeButton>
        <Modal.Title>تقرير إصابة جديد</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>موقع الإصابة</Form.Label>
                <Form.Control
                  type="text"
                  name="injuryLocation"
                  value={formData.injuryLocation}
                  onChange={handleInputChange}
                  placeholder="مثال: تمزق في العضلة الرباعية"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الجزء المصاب</Form.Label>
                <Form.Select
                  name="bodyPart"
                  value={formData.bodyPart}
                  onChange={handleInputChange}
                >
                  {bodyPartOptions.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>تاريخ الإبلاغ/الإصابة</Form.Label>
                <Form.Control
                  type="date"
                  name="reportDate"
                  value={formData.reportDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>مستوى الألم (1-10)</Form.Label>
                <Form.Range
                  min="1"
                  max="10"
                  name="painLevel"
                  value={formData.painLevel}
                  onChange={handleInputChange}
                />
                <div className="text-center">
                  <span className="badge bg-primary">{formData.painLevel}/10</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>كيف حدثت الإصابة؟</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="howItHappened"
              value={formData.howItHappened}
              onChange={handleInputChange}
              placeholder="اشرح بالتفصيل كيف حدثت الإصابة..."
              required
            />
          </Form.Group>

          {showAlert && (
            <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
              <Alert.Heading>⚠️ معلومات ناقصة</Alert.Heading>
              الرجاء ملء جميع الحقول المطلوبة.
            </Alert>
          )}

          {formData.painLevel >= 8 && (
            <Alert variant="warning">
              <Alert.Heading>⚠️ مستوى ألم عالي</Alert.Heading>
              بسبب مستوى الألم العالي، سيتم إرسال تنبيه عاجل للطاقم الطبي.
              ننصح بالحصول على عناية طبية فورية.
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              إرسال التقرير
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default InjuryReportForm;
