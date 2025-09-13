import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap';

import type { ClubSection, SectionType } from '../../../types/clubManagement';

interface SectionsManagementSectionProps {
  sections: ClubSection[];
  onUpdate: (sections: ClubSection[]) => void;
}

const SectionsManagementSection: React.FC<SectionsManagementSectionProps> = ({ sections, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<ClubSection | null>(null);
  const [formData, setFormData] = useState<Partial<ClubSection>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sectionTypes: { key: SectionType; label: string; labelAr: string; icon: string }[] = [
    { key: 'about', label: 'About', labelAr: 'عن النادي', icon: 'info-circle' },
    { key: 'history', label: 'History', labelAr: 'التاريخ', icon: 'clock' },
    { key: 'mission', label: 'Mission', labelAr: 'المهمة', icon: 'target' },
    { key: 'vision', label: 'Vision', labelAr: 'الرؤية', icon: 'eye' },
    { key: 'values', label: 'Values', labelAr: 'القيم', icon: 'heart' },
    { key: 'facilities', label: 'Facilities', labelAr: 'المرافق', icon: 'building' },
    { key: 'training', label: 'Training', labelAr: 'التدريب', icon: 'dumbbell' },
    { key: 'competitions', label: 'Competitions', labelAr: 'المنافسات', icon: 'trophy' },
    { key: 'contact', label: 'Contact', labelAr: 'الاتصال', icon: 'phone' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titleAr) newErrors.titleAr = 'العنوان (عربي) مطلوب';
    if (!formData.title) newErrors.title = 'Title (English) is required';
    if (!formData.type) newErrors.type = 'نوع القسم مطلوب';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingSection(null);
    setFormData({
      id: Date.now().toString(),
      type: 'about' as SectionType,
      title: '',
      titleAr: '',
      content: '',
      contentAr: '',
      order: sections.length + 1,
      isActive: true,
      image: '',
      icon: ''
    });
    setShowModal(true);
  };

  const handleEdit = (section: ClubSection) => {
    setEditingSection(section);
    setFormData({ ...section });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      onUpdate(sections.filter(s => s.id !== id));
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedType = sectionTypes.find(t => t.key === formData.type);
    
    const updatedSection: ClubSection = {
      id: editingSection?.id || formData.id || Date.now().toString(),
      type: formData.type as SectionType,
      title: formData.title || '',
      titleAr: formData.titleAr || '',
      content: formData.content || '',
      contentAr: formData.contentAr || '',
      order: formData.order || sections.length + 1,
      isActive: formData.isActive !== false,
      image: formData.image || '',
      icon: selectedType?.icon || formData.icon || ''
    };

    if (editingSection) {
      onUpdate(sections.map(s => s.id === editingSection.id ? updatedSection : s));
    } else {
      onUpdate([...sections, updatedSection]);
    }

    setShowModal(false);
    setFormData({});
    setErrors({});
  };

  const reorderSections = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) {
      return;
    }

    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    // Update order values
    newSections.forEach((section, idx) => {
      section.order = idx + 1;
    });

    onUpdate(newSections);
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">إدارة الأقسام</h5>
          <Button variant="primary" size="sm" onClick={handleAdd}>
            ➕
            إضافة قسم جديد
          </Button>
        </Card.Header>
        <Card.Body>
          {sections.length === 0 ? (
            <Alert variant="info" className="text-center">
              لا توجد أقسام. أضف أقسام لعرض معلومات النادي بشكل منظم.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>النوع</th>
                    <th>العنوان</th>
                    <th>الحالة</th>
                    <th>الترتيب</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.sort((a, b) => a.order - b.order).map((section, index) => {
                    const sectionType = sectionTypes.find(t => t.key === section.type);
                    return (
                      <tr key={section.id}>
                        <td>{index + 1}</td>
                        <td>
                          <Badge bg="info">
                            👁️ معاينة {sectionType?.labelAr}
                          </Badge>
                        </td>
                        <td>
                          <div>
                            <strong>{section.titleAr}</strong>
                            <br />
                            <small className="text-muted">{section.title}</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={section.isActive ? 'success' : 'danger'}>
                            {section.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => reorderSections(section.id, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => reorderSections(section.id, 'down')}
                              disabled={index === sections.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEdit(section)}
                          >
                            👁️ معاينة
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(section.id)}
                          >
                            🗑️ حذف
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Section Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>العنوان (عربي) *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.titleAr || ''}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  isInvalid={!!errors.titleAr}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.titleAr}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title (English) *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>نوع القسم *</Form.Label>
                <Form.Select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SectionType })}
                  isInvalid={!!errors.type}
                >
                  <option value="">اختر النوع...</option>
                  {sectionTypes.map(type => (
                    <option key={type.key} value={type.key}>{type.labelAr}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الترتيب</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={formData.order || sections.length + 1}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>المحتوى (عربي)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.contentAr || ''}
                  onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                  placeholder="المحتوى التفصيلي باللغة العربية..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Content (English)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed content in English..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>رابط الصورة</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="نشط"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </Form.Group>
            </Col>
          </Row>

          {formData.image && (
            <Row>
              <Col md={12}>
                <div className="mb-3">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                    className="rounded"
                  />
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingSection ? 'تحديث' : 'إضافة'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SectionsManagementSection;
