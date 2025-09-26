import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import type { Athlete } from '../../types';
import { UsersService as UserService } from '../../services/firestoreService';
import { setDoc, updateDoc, doc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface BeltManagementProps {
  club: any;
}

const BeltManagement: React.FC<BeltManagementProps> = ({ club }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState<boolean>(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [promotionDate, setPromotionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [grade, setGrade] = useState<string>('ممتاز');

  const beltLevels = ['أبيض', 'أصفر', 'برتقالي', 'أخضر', 'أزرق', 'بني', 'أسود'];
  const grades = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول'];

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const athletesData = await UserService.getAthletesByClub(club.id);
      // Map User[] to Athlete[] with proper null checks
      const mappedAthletes: Athlete[] = athletesData.map(user => ({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        firstNameAr: user.firstNameAr || user.firstName || '',
        lastNameAr: user.lastNameAr || user.lastName || '',
        dateOfBirth: user.dateOfBirth || new Date('2000-01-01'),
        gender: user.gender || 'male',
        belt: user.belt || 'أبيض',
        beltAr: user.beltAr || user.belt || 'أبيض',
        weight: user.weight || 70,
        height: user.height || 175,
        clubId: user.clubId || club.id,
        bio: '',
        bioAr: '',
        image: '/images/default-athlete.jpg',
        achievements: [],
        achievementsAr: [],
        isActive: user.isActive,
        createdAt: user.createdAt
      }));
      setAthletes(mappedAthletes);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBeltLevel = (belt: string) => {
    const levels = ['أبيض', 'أصفر', 'برتقالي', 'أخضر', 'أزرق', 'بني', 'أسود'];
    for (let i = 0; i < levels.length; i++) {
      if (belt.includes(levels[i])) {
        return { level: i + 1, total: levels.length, name: levels[i] };
      }
    }
    return { level: 1, total: levels.length, name: 'أبيض' };
  };

  const getNextBelt = (currentBelt: string) => {
    const current = getBeltLevel(currentBelt);
    const nextIndex = Math.min(current.level, beltLevels.length - 1);
    return beltLevels[nextIndex];
  };

  const handlePromotionSubmit = async () => {
    if (!selectedAthlete) return;

    const currentBelt = getBeltLevel(selectedAthlete.beltAr);
    const nextBelt = getNextBelt(selectedAthlete.beltAr);

    if (currentBelt.level >= beltLevels.length) {
      alert('الرياضي وصل لأعلى رتبة!');
      return;
    }

    try {
      const newBelt = beltLevels[currentBelt.level];

      // Update athlete's current belt (use server timestamps for rules compatibility)
      await updateDoc(doc(db, 'users', selectedAthlete.id), {
        belt: newBelt,
        beltAr: newBelt,
        updatedAt: serverTimestamp()
      });

      // Add to belt history (store both string date and timestamp for robust querying)
      await addDoc(collection(db, 'beltHistory'), {
        athleteId: selectedAthlete.id,
        belt: newBelt,
        date: promotionDate, // ISO string (YYYY-MM-DD)
        dateTs: Timestamp.fromDate(new Date(promotionDate)),
        examiner: 'المدرب',
        grade: grade,
        notes: notes,
        previousBelt: selectedAthlete.beltAr,
        createdAt: serverTimestamp()
      });

      alert('تم ترقية الرياضي بنجاح!');
      setShowPromotionModal(false);
      fetchAthletes(); // Refresh data

    } catch (error) {
      console.error('Error promoting athlete:', error);
      alert('حدث خطأ في الترقية');
    }
  };

  const handleRequirementsSubmit = async () => {
    if (!selectedAthlete || requirements.filter(r => r.trim()).length === 0) return;

    const filteredRequirements = requirements.filter(r => r.trim());

    try {
      // Save requirements to Firestore
      await setDoc(doc(db, 'beltRequirements', selectedAthlete.id), {
        athleteId: selectedAthlete.id,
        requirements: filteredRequirements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      alert('تم حفظ متطلبات الحزام بنجاح!');
      setShowRequirementsModal(false);

    } catch (error) {
      console.error('Error saving requirements:', error);
      alert('حدث خطأ في حفظ المتطلبات');
    }
  };

  const addRequirement = () => {
    setRequirements(prev => [...prev, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    setRequirements(prev => prev.map((req, i) => i === index ? value : req));
  };

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
  return (
    <React.Fragment>
    <Card className="shadow-sm">
        <Card.Body className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-3">جاري تحميل بيانات الرياضيين...</p>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
  }

  return (
    <React.Fragment>
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white d-flex align-items-center justify-content-between">
        <div className="text-end" dir="rtl">
          <h4 className="mb-0" dir="rtl">
            إدارة الأحزمة
          </h4>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <Row>
        {athletes.map(athlete => {
          const beltProgress = getBeltLevel(athlete.beltAr);

          return (
            <Col md={6} lg={4} key={athlete.id} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="text-center">
                  <h6 dir="rtl" className="mb-0">{athlete.firstNameAr} {athlete.lastNameAr}</h6>
                  <Badge bg={beltProgress.name.includes('أبيض') ? 'light' : 'primary'} className="mt-2">
                    {athlete.beltAr}
                  </Badge>
                </Card.Header>
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <small className="text-muted d-block" dir="rtl">التقدم في الأحزمة</small>
                    <ProgressBar
                      now={(beltProgress.level / beltProgress.total) * 100}
                      variant="success"
                      className="mb-1"
                      style={{ height: '8px' }}
                    />
                    <small className="text-muted">{beltProgress.level}/{beltProgress.total}</small>
                  </div>

                  <div className="mb-3">
                    {beltProgress.level < beltLevels.length && (
                      <small className="text-muted d-block" dir="rtl">الحزام التالي: {getNextBelt(athlete.beltAr)}</small>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={beltProgress.level >= beltLevels.length}
                      onClick={() => {
                        setSelectedAthlete(athlete);
                        setShowPromotionModal(true);
                      }}
                    >
                      <i className="fas fa-medal me-1"></i>
                      ترقية
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAthlete(athlete);
                        setShowRequirementsModal(true);
                        setRequirements(['إتقان 10 تقنيات رمي جديدة', 'إتقان 5 تقنيات أرضية متقدمة', 'المشاركة في 3 بطولات على الأقل']);
                      }}
                    >
                      <i className="fas fa-list-check me-1"></i>
                      متطلبات
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card.Body>
    </Card>

      {/* Promotion Modal */}
      <Modal show={showPromotionModal} onHide={() => setShowPromotionModal(false)} dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>ترقية رياضي</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAthlete && (
            <div>
              <h5 className="text-center mb-3">{selectedAthlete.firstNameAr} {selectedAthlete.lastNameAr}</h5>
              <div className="text-center mb-4">
                <Badge bg="primary" className="fs-5">{selectedAthlete.beltAr}</Badge>
                <p className="text-muted mt-2">سيتم الترقية إلى: {getNextBelt(selectedAthlete.beltAr)}</p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>تاريخ الترقية</Form.Label>
                <Form.Control
                  type="date"
                  value={promotionDate}
                  onChange={(e) => setPromotionDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>التقدير</Form.Label>
                <Form.Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>ملاحظات</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب ملاحظات الترقية..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPromotionModal(false)}>
            إلغاء
          </Button>
          <Button variant="success" onClick={handlePromotionSubmit}>
            تأكيد الترقية
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Requirements Modal */}
      <Modal show={showRequirementsModal} onHide={() => setShowRequirementsModal(false)} dir="rtl" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>تحديد متطلبات الحزام التالي</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAthlete && (
            <div>
              <h5 className="text-center mb-4">
                متطلبات الحزام التالي لـ {selectedAthlete.firstNameAr} {selectedAthlete.lastNameAr}
              </h5>
              <div className="text-center mb-4">
                <Badge bg="info" className="fs-6">
                  الحالي: {selectedAthlete.beltAr} | التالي: {getNextBelt(selectedAthlete.beltAr)}
                </Badge>
              </div>

              <p className="text-muted text-center mb-3">
                حدد المتطلبات التي يجب على الرياضي إكمالها للحصول على الحزام التالي:
              </p>

              {requirements.map((req, index) => (
                <div key={index} className="mb-2">
                  <Row>
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        disabled={requirements.length === 1}
                      >
                        <i className="fas fa-minus"></i>
                      </Button>
                    </Col>
                    <Col md={10}>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`متطلب رقم ${index + 1}...`}
                      />
                    </Col>
                    {index === requirements.length - 1 && (
                      <Col md={1}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={addRequirement}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      </Col>
                    )}
                  </Row>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequirementsModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleRequirementsSubmit}>
            حفظ المتطلبات
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default BeltManagement;
