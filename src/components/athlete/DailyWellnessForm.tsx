import React, { useState } from 'react';
import { formatDate } from '../../utils/date';
import { Modal, Form, Button, Row, Col, Card } from 'react-bootstrap';
import type { DailyWellness } from '../../types/medical';
import { MedicalService } from '../../services/medicalService';

interface Props {
  athleteId: string;
  onSubmit: (wellness: DailyWellness) => void;
  onCancel: () => void;
}

const DailyWellnessForm: React.FC<Props> = ({ athleteId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sleepQuality: 3,
    fatigueLevel: 3,
    muscleSoreness: 3,
    stressLevel: 3,
    mood: 3,
    additionalNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const wellness: DailyWellness = {
      id: MedicalService.generateId(),
      athleteId,
      date: new Date(),
      sleepQuality: formData.sleepQuality,
      fatigueLevel: formData.fatigueLevel,
      muscleSoreness: formData.muscleSoreness,
      stressLevel: formData.stressLevel,
      mood: formData.mood,
      wellnessScore: 0, // سيتم حسابها في الخدمة
      additionalNotes: formData.additionalNotes || undefined
    };

    onSubmit(wellness);
  };

  const handleSliderChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getScaleLabel = (field: string, value: number) => {
    const labels: { [key: string]: { [key: number]: string } } = {
      sleepQuality: {
        1: 'سيء جداً',
        2: 'سيء',
        3: 'متوسط',
        4: 'جيد',
        5: 'ممتاز'
      },
      fatigueLevel: {
        1: 'منتعش تماماً',
        2: 'منتعش',
        3: 'متوسط',
        4: 'متعب',
        5: 'متعب جداً'
      },
      muscleSoreness: {
        1: 'لا ألم',
        2: 'ألم خفيف',
        3: 'ألم متوسط',
        4: 'ألم شديد',
        5: 'ألم شديد جداً'
      },
      stressLevel: {
        1: 'مسترخي تماماً',
        2: 'مسترخي',
        3: 'متوسط',
        4: 'متوتر',
        5: 'متوتر جداً'
      },
      mood: {
        1: 'سيء جداً',
        2: 'سيء',
        3: 'متوسط',
        4: 'جيد',
        5: 'ممتاز'
      }
    };

    return labels[field]?.[value] || '';
  };

  const getSliderColor = (field: string, value: number) => {
    // للنوم والمزاج: كلما زاد كان أفضل
    if (field === 'sleepQuality' || field === 'mood') {
      if (value >= 4) return 'success';
      if (value >= 3) return 'warning';
      return 'danger';
    }
    
    // للتعب والتوتر وألم العضلات: كلما قل كان أفضل
    if (value <= 2) return 'success';
    if (value <= 3) return 'warning';
    return 'danger';
  };

  const ScaleSlider = ({ 
    field, 
    label, 
    value, 
    icon 
  }: { 
    field: keyof typeof formData, 
    label: string, 
    value: number, 
    icon: string 
  }) => (
    <Card className="mb-3">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={1}>
            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
          </Col>
          <Col xs={3}>
            <strong>{label}</strong>
          </Col>
          <Col xs={6}>
            <Form.Range
              min="1"
              max="5"
              value={value}
              onChange={(e) => handleSliderChange(field, parseInt(e.target.value))}
              className={`text-${getSliderColor(field, value)}`}
            />
            <div className="d-flex justify-content-between small text-muted">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </Col>
          <Col xs={2}>
            <div className="text-center">
              <div className={`h5 text-${getSliderColor(field, value)} mb-0`}>
                {value}
              </div>
              <div className={`small text-${getSliderColor(field, value)}`}>
                {getScaleLabel(field, value)}
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <Modal show onHide={onCancel} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>📊 التقييم اليومي للصحة</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="text-center mb-4">
            <h6 className="text-muted">
              كيف تشعر اليوم؟ يستغرق هذا التقييم أقل من دقيقة واحدة
            </h6>
            <small className="text-muted">التاريخ: {formatDate(new Date())}</small>
          </div>

          <ScaleSlider
            field="sleepQuality"
            label="جودة النوم"
            value={formData.sleepQuality}
            icon="😴"
          />

          <ScaleSlider
            field="fatigueLevel"
            label="مستوى التعب"
            value={formData.fatigueLevel}
            icon="💤"
          />

          <ScaleSlider
            field="muscleSoreness"
            label="ألم العضلات"
            value={formData.muscleSoreness}
            icon="💪"
          />

          <ScaleSlider
            field="stressLevel"
            label="مستوى التوتر"
            value={formData.stressLevel}
            icon="😰"
          />

          <ScaleSlider
            field="mood"
            label="الحالة المزاجية"
            value={formData.mood}
            icon="😊"
          />

          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>
                  <strong>📝 ملاحظات إضافية (اختيارية)</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="أي معلومات إضافية تود إضافتها عن حالتك اليوم..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    additionalNotes: e.target.value 
                  }))}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* معاينة مؤشر الصحة */}
          <Card className="mt-3 bg-light">
            <Card.Body className="text-center">
              <h6>مؤشر الصحة المتوقع</h6>
              <div className={`h3 text-${getSliderColor('overall', MedicalService.calculateWellnessScore({
                id: '',
                athleteId,
                date: new Date(),
                sleepQuality: formData.sleepQuality,
                fatigueLevel: formData.fatigueLevel,
                muscleSoreness: formData.muscleSoreness,
                stressLevel: formData.stressLevel,
                mood: formData.mood,
                wellnessScore: 0
              }))}`}>
                {MedicalService.calculateWellnessScore({
                  id: '',
                  athleteId,
                  date: new Date(),
                  sleepQuality: formData.sleepQuality,
                  fatigueLevel: formData.fatigueLevel,
                  muscleSoreness: formData.muscleSoreness,
                  stressLevel: formData.stressLevel,
                  mood: formData.mood,
                  wellnessScore: 0
                }).toFixed(1)}
              </div>
              <small className="text-muted">من 5.0</small>
            </Card.Body>
          </Card>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel}>
            إلغاء
          </Button>
          <Button variant="primary" type="submit">
            💾 حفظ التقييم
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DailyWellnessForm;
