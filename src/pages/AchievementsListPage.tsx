import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HomepageService } from '../services/homepageService';
import type { RecentAchievement } from '../types';

const AchievementsListPage: React.FC = () => {
  const [achievements, setAchievements] = useState<RecentAchievement[]>([]);

  useEffect(() => {
    (async () => {
      const content = await HomepageService.getContent();
      setAchievements(content.recentAchievements || []);
    })();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-success" dir="rtl">جميع الإنجازات</h2>
      <Row>
        {achievements.length === 0 && (
          <Col>
            <div className="text-center text-muted py-5">لا توجد إنجازات متاحة حالياً</div>
          </Col>
        )}
        {achievements.map((a) => (
          <Col md={3} key={a.id} className="mb-3">
            <Card className="h-100 shadow-sm text-center">
              {a.image && (
                <Card.Img variant="top" src={a.image} alt={a.titleAr} style={{ height: 160, objectFit: 'cover' }} />
              )}
              <Card.Body>
                <h6 className="mb-2" dir="rtl">{a.athleteNameAr}</h6>
                <p className="small text-muted mb-2" dir="rtl">{a.titleAr}</p>
                <Badge bg="info" className="mb-2">{a.achievementTypeAr}</Badge>
                <p className="small text-muted mb-2" dir="rtl">{new Date(a.achievementDate as any).toLocaleDateString('ar-DZ')}</p>
                <div>
                  <Link to={`/achievement/${a.id}`} className="btn btn-outline-success btn-sm">اقرأ المزيد</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AchievementsListPage;
