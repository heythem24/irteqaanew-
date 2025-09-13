import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap';
import type { DetailedStaff } from '../../../types/clubManagement';

interface StaffManagementSectionProps {
  staff: DetailedStaff[];
  clubId?: string;
  onSaveStaff: (staffMember: DetailedStaff) => void;
}

const StaffManagementSection: React.FC<StaffManagementSectionProps> = ({ staff, onSaveStaff }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<DetailedStaff | null>(null);
  const [formData, setFormData] = useState<Partial<DetailedStaff>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const positions = [
    { key: 'club_president', label: 'رئيس النادي', labelAr: 'رئيس النادي' },
    { key: 'technical_director', label: 'المدير التقني', labelAr: 'المدير التقني' },
    { key: 'coach', label: 'المدرب', labelAr: 'المدرب' },
    { key: 'physical_trainer', label: 'المحضر البدني', labelAr: 'المحضر البدني' },
    { key: 'general_secretary', label: 'الكاتب العام', labelAr: 'الكاتب العام' },
    { key: 'treasurer', label: 'أمين المال', labelAr: 'أمين المال' },
    { key: 'assistant_coach', label: 'مساعد مدرب', labelAr: 'مساعد مدرب' },
    { key: 'team_manager', label: 'مدير الفريق', labelAr: 'مدير الفريق' },
    { key: 'medical_trainer', label: 'مدرب طبي', labelAr: 'مدرب طبي' },
    { key: 'psychologist', label: 'معالج نفسي', labelAr: 'معالج نفسي' }
  ];

  const departments = [
    { key: 'management', label: 'الإدارة', labelAr: 'الإدارة' },
    { key: 'technical', label: 'الفني', labelAr: 'الفني' },
    { key: 'medical', label: 'الطبي', labelAr: 'الطبي' },
    { key: 'administrative', label: 'الإداري', labelAr: 'الإداري' },
    { key: 'support', label: 'الدعم', labelAr: 'الدعم' }
  ];

  const validateRoleConflict = () => {
    const newErrors: Record<string, string> = {};
    
    // التحقق من وجود المنصب في النادي
    const existingPosition = staff.find(
      member => member.position === formData.position && 
      member.id !== editingStaff?.id
    );
    
    if (existingPosition) {
      const positionLabel = positions.find(p => p.key === formData.position)?.labelAr || formData.position;
      newErrors.position = `المنصب "${positionLabel}" موجود بالفعل في هذا النادي`;
    }
    
    return newErrors;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstNameAr) newErrors.firstNameAr = 'الاسم الأول (عربي) مطلوب';
    if (!formData.lastNameAr) newErrors.lastNameAr = 'اسم العائلة (عربي) مطلوب';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.position) newErrors.position = 'المنصب مطلوب';
    if (!formData.department) newErrors.department = 'القسم مطلوب';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    // التحقق من تعارض المنصب
    const roleErrors = validateRoleConflict();
    Object.assign(newErrors, roleErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setFormData({
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      position: '' as any,
      positionAr: '',
      department: '',
      departmentAr: '',
      bio: '',
      bioAr: '',
      biography: '',
      biographyAr: '',
      email: '',
      phone: '',
      image: '',
      qualifications: [],
      qualificationsAr: [],
      achievements: [],
      achievementsAr: [],
      socialLinks: [],
      isActive: true,
      order: staff.length + 1
    });
    setShowModal(true);
  };

  const handleEdit = (staffMember: DetailedStaff) => {
    setEditingStaff(staffMember);
    setFormData({
      ...staffMember,
      qualifications: staffMember.qualifications || [],
      qualificationsAr: staffMember.qualificationsAr || [],
      achievements: staffMember.achievements || [],
      achievementsAr: staffMember.achievementsAr || [],
      socialLinks: staffMember.socialLinks || []
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      // This should also call a delete function, but for now, we focus on creation
      console.warn("Delete functionality not fully implemented with Firestore yet.");
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedPosition = positions.find(p => p.key === formData.position);
    const selectedDepartment = departments.find(d => d.key === formData.department);

    const updatedStaff: DetailedStaff = {
      id: editingStaff?.id || formData.id || Date.now().toString(),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      firstNameAr: formData.firstNameAr || '',
      lastNameAr: formData.lastNameAr || '',
      position: formData.position as any,
      positionAr: selectedPosition?.labelAr || '',
      department: formData.department || '',
      departmentAr: selectedDepartment?.labelAr || '',
      bio: formData.bio || '',
      bioAr: formData.bioAr || '',
      biography: formData.biography || '',
      biographyAr: formData.biographyAr || '',
      email: formData.email || '',
      phone: formData.phone || '',
      image: formData.image || '',
      qualifications: formData.qualifications || [],
      qualificationsAr: formData.qualificationsAr || [],
      achievements: formData.achievements || [],
      achievementsAr: formData.achievementsAr || [],
      socialLinks: formData.socialLinks || [],
      isActive: formData.isActive !== false,
      order: formData.order || staff.length + 1,
      createdAt: editingStaff?.createdAt || new Date()
    };

    // Instead of updating a local list, we now call the onSaveStaff prop
    // which will handle the backend communication, for both create and update.
    onSaveStaff(updatedStaff);

    setShowModal(false);
    setFormData({});
    setErrors({});
  };

  const handleArrayChange = (field: string, value: string, index?: number) => {
    const currentArray = (formData as any)[field] || [];
    if (index !== undefined) {
      const newArray = [...currentArray];
      newArray[index] = value;
      setFormData({ ...formData, [field]: newArray });
    } else {
      setFormData({ ...formData, [field]: [...currentArray, value] });
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = (formData as any)[field] || [];
    setFormData({
      ...formData,
      [field]: currentArray.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">إدارة الطاقم</h5>
          <Button variant="primary" size="sm" onClick={handleAdd}>
            ➕
            إضافة عضو جديد
          </Button>
        </Card.Header>
        <Card.Body>
          {staff.length === 0 ? (
            <Alert variant="info" className="text-center">
              لا يوجد أعضاء في الطاقم. أضف أول عضو لبدء بناء فريقك.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الصورة</th>
                    <th>الاسم</th>
                    <th>المنصب</th>
                    <th>القسم</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.sort((a, b) => a.order - b.order).map((member, index) => (
                    <tr key={member.id}>
                      <td>{index + 1}</td>
                      <td>
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.firstNameAr} 
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                          />
                        ) : (
                          <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" 
                               style={{ width: '40px', height: '40px' }}>
                            👤
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{member.firstNameAr} {member.lastNameAr}</strong>
                          <br />
                          <small className="text-muted">{member.firstName} {member.lastName}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="primary">{member.positionAr}</Badge>
                      </td>
                      <td>
                        <Badge bg="secondary">{member.departmentAr}</Badge>
                      </td>
                      <td>
                        <Badge bg={member.isActive ? 'success' : 'danger'}>
                          {member.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleEdit(member)}
                        >
                          ✏️
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStaff ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الاسم الأول (عربي) *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstNameAr || ''}
                  onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                  isInvalid={!!errors.firstNameAr}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstNameAr}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>اسم العائلة (عربي) *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastNameAr || ''}
                  onChange={(e) => setFormData({ ...formData, lastNameAr: e.target.value })}
                  isInvalid={!!errors.lastNameAr}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastNameAr}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>المنصب *</Form.Label>
                <Form.Select
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                  isInvalid={!!errors.position}
                >
                  <option value="">اختر المنصب...</option>
                  {positions.map(pos => (
                    <option key={pos.key} value={pos.key}>{pos.labelAr}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.position}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>القسم *</Form.Label>
                <Form.Select
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  isInvalid={!!errors.department}
                >
                  <option value="">اختر القسم...</option>
                  {departments.map(dept => (
                    <option key={dept.key} value={dept.key}>{dept.labelAr}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.department}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>البريد الإلكتروني</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>رقم الهاتف</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>السيرة الذاتية (عربي)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.biographyAr || ''}
                  onChange={(e) => setFormData({ ...formData, biographyAr: e.target.value })}
                  placeholder="سيرة ذاتية تفصيلية باللغة العربية..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Biography (English)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.biography || ''}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Detailed biography in English..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>المؤهلات</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    placeholder="أضف مؤهلاً جديداً"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim()) {
                          handleArrayChange('qualificationsAr', value.trim());
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {(formData.qualificationsAr || []).map((qual, index) => (
                    <Badge key={index} bg="primary" className="p-2">
                      {qual}
                      <span 
                        className="ms-2 cursor-pointer"
                        onClick={() => removeArrayItem('qualificationsAr', index)}
                      >
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>الإنجازات</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    placeholder="أضف إنجازاً جديداً"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim()) {
                          handleArrayChange('achievementsAr', value.trim());
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {(formData.achievementsAr || []).map((ach, index) => (
                    <Badge key={index} bg="success" className="p-2">
                      {ach}
                      <span 
                        className="ms-2 cursor-pointer"
                        onClick={() => removeArrayItem('achievementsAr', index)}
                      >
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSave}>
            {editingStaff ? 'تحديث' : 'إضافة'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StaffManagementSection;
