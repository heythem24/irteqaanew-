import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import type { Athlete } from '../../types';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface BeltsAndPromotionsProps {
  athlete: Athlete;
  beltColor: string;
}

const BeltsAndPromotions: React.FC<BeltsAndPromotionsProps> = ({ athlete, beltColor }) => {
  const [beltHistory, setBeltHistory] = useState<any[]>([]);
  const [nextBeltRequirements, setNextBeltRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getBeltLevel = (belt: string) => {
    const levels = ['أبيض', 'أصفر', 'برتقالي', 'أخضر', 'أزرق', 'بني', 'أسود'];
    for (let i = 0; i < levels.length; i++) {
      if (belt.includes(levels[i])) {
        return { level: i + 1, total: levels.length, name: levels[i] };
      }
    }
    return { level: 1, total: levels.length, name: 'أبيض' };
  };

  const getBeltColorClass = (beltName: string) => {
    if (beltName.includes('أبيض')) return 'light';
    if (beltName.includes('أصفر')) return 'warning';
    if (beltName.includes('برتقالي')) return 'warning';
    if (beltName.includes('أخضر')) return 'success';
    if (beltName.includes('أزرق')) return 'primary';
    if (beltName.includes('بني')) return 'secondary';
    if (beltName.includes('أسود')) return 'dark';
    return 'secondary';
  };

  // Fetch belt history from Firestore
  useEffect(() => {
    const beltHistoryQuery = query(
      collection(db, 'beltHistory'),
      where('athleteId', '==', athlete.id)
    );

    const unsubscribe = onSnapshot(beltHistoryQuery, (querySnapshot) => {
      const history: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          belt: data.belt,
          date: data.date,
          examiner: data.examiner,
          grade: data.grade,
          notes: data.notes
        });
      });
      // Sort by date descending (most recent first)
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBeltHistory(history);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [athlete.id]);

  // Fetch belt requirements from Firestore
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const requirementsRef = collection(db, 'beltRequirements');
        const querySnapshot = await getDocs(requirementsRef);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.athleteId === athlete.id) {
            setNextBeltRequirements(data.requirements || []);
          }
        });
      } catch (error) {
        console.error('Error fetching requirements:', error);
      }
    };

    fetchRequirements();
  }, [athlete.id]);

  const beltProgress = getBeltLevel(athlete.beltAr);

  // Default fallback requirements if none set by coach
  if (nextBeltRequirements.length === 0 && !loading) {
    setNextBeltRequirements([
      'إتقان 10 تقنيات رمي جديدة',
      'إتقان 5 تقنيات أرضية متقدمة',
      'المشاركة في 3 بطولات على الأقل',
      'تدريب منتظم لمدة 6 أشهر',
      'اجتياز الامتحان النظري'
    ]);
  }

  return (
    <div>
      {/* مستوى الحزام الحالي */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className={`bg-${beltColor} text-white`}>
              <h5 className="mb-0" dir="rtl">
                <i className="fas fa-medal me-2"></i>
                مستوى الحزام الحالي
              </h5>
            </Card.Header>
            <Card.Body className="p-4 text-center">
              <div className="mb-4">
                <Badge bg={beltColor} className="fs-3 p-3">
                  {athlete.beltAr}
                </Badge>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-end" dir="rtl">التقدم في الأحزمة</span>
                  <span>{beltProgress.level}/{beltProgress.total}</span>
                </div>
                <ProgressBar
                  now={(beltProgress.level / beltProgress.total) * 100}
                  variant={beltColor}
                  className="mb-2"
                  style={{ height: '10px' }}
                />
                <small className="text-muted text-end d-block" dir="rtl">
                  المستوى الحالي: {beltProgress.name}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className={`bg-${beltColor} text-white`}>
              <h5 className="mb-0" dir="rtl">
                <i className="fas fa-target me-2"></i>
                متطلبات الحزام التالي
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <ul className="list-unstyled mb-0">
                {nextBeltRequirements.map((requirement, index) => (
                  <li key={index} className="mb-2 text-end" dir="rtl">
                    <i className={`fas fa-check-circle text-${beltColor} me-2`}></i>
                    {requirement}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* تاريخ الأحزمة */}
      <Card className="shadow-sm mb-4">
        <Card.Header className={`bg-${beltColor} text-white`}>
          <h5 className="mb-0" dir="rtl">
            <i className="fas fa-history me-2"></i>
            تاريخ الأحزمة والترقيات
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="timeline">
            {beltHistory.map((promotion, index) => (
              <div key={index} className="timeline-item mb-4">
                <Row className="align-items-center">
                  <Col md={3} className="text-center">
                    <div className="timeline-date">
                      <Badge bg={getBeltColorClass(promotion.belt)} className="fs-6 p-2">
                        {promotion.belt}
                      </Badge>
                      <p className="text-muted small mt-2 mb-0">
                        {new Date(promotion.date).toLocaleDateString('ar-DZ')}
                      </p>
                    </div>
                  </Col>
                  <Col md={9}>
                    <Card className="border-start border-3" style={{ borderColor: `var(--bs-${getBeltColorClass(promotion.belt)})` }}>
                      <Card.Body className="p-3">
                        <h6 className="mb-2" dir="rtl">
                          <i className="fas fa-user-tie me-2"></i>
                          الممتحن: {promotion.examiner}
                        </h6>
                        <p className="mb-2" dir="rtl">
                          <strong>التقدير:</strong> 
                          <Badge bg="success" className="ms-2">{promotion.grade}</Badge>
                        </p>
                        <p className="text-muted mb-0 text-end" dir="rtl">
                          {promotion.notes}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* إحصائيات الترقيات */}
      <Row>
        <Col lg={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="p-4">
              <h3 className={`text-${beltColor} mb-2`}>
                {beltHistory.length}
              </h3>
              <p className="text-muted mb-0" dir="rtl">عدد الترقيات</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="p-4">
              <h3 className={`text-${beltColor} mb-2`}>
                {Math.round(((beltProgress.level / beltProgress.total) * 100))}%
              </h3>
              <p className="text-muted mb-0" dir="rtl">نسبة التقدم</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="p-4">
              <h3 className={`text-${beltColor} mb-2`}>
                {beltHistory.length > 0
                  ? new Date().getFullYear() - new Date(beltHistory[beltHistory.length - 1].date).getFullYear()
                  : '0'
                }
              </h3>
              <p className="text-muted mb-0" dir="rtl">سنوات الممارسة</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BeltsAndPromotions;
