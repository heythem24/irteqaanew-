import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import type { Injury } from '../../types/medical';
import { MedicalService } from '../../services/medicalService';

interface Props {
  athleteId: string;
  onSubmit: (injury: Injury) => void;
  onCancel: () => void;
}

const bodyPartOptions = [
  'head',
  'neck',
  'shoulder',
  'elbow',
  'wrist',
  'hand',
  'chest',
  'back',
  'abdomen',
  'hip',
  'thigh',
  'knee',
  'calf',
  'ankle',
  'foot'
] as const;

const InjuryReportForm: React.FC<Props> = ({ athleteId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    injuryLocation: '',
    bodyPart: bodyPartOptions[0],
    painLevel: 5,
    howItHappened: ''
  });

  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.injuryLocation.trim() || !formData.howItHappened.trim()) {
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
      reportDate: new Date(),
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
                  {bodyPartOptions.map(part => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </Form.Select>
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
