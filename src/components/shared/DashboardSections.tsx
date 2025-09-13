import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { News, FeaturedLeague, RecentAchievement } from '../../types';

interface NewsSectionProps {
  news: News[];
  onViewAll?: () => void;
}

const NewsSection: React.FC<NewsSectionProps> = ({ news, onViewAll }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-newspaper me-2"></i>
          الأخبار
        </h5>
        {onViewAll && (
          <Button variant="outline-light" size="sm" onClick={onViewAll}>
            عرض الكل
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {news.length > 0 ? (
          <Row>
            {news.slice(0, 3).map(item => (
              <Col md={4} key={item.id} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <h6 className="mb-2">{item.titleAr}</h6>
                    <p className="text-muted small mb-2">{item.excerptAr}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        {item.authorAr}
                      </small>
                      <Badge bg={item.isPublished ? 'success' : 'secondary'}>
                        {item.isPublished ? 'منشور' : 'مسودة'}
                      </Badge>
                    </div>
                    <div className="mt-3 text-end">
                      <Link to={`/news/${item.id}`} className="btn btn-outline-primary btn-sm">
                        اقرأ المزيد
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
            <p className="text-muted">لا توجد أخبار متاحة حالياً</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

interface FeaturedLeaguesSectionProps {
  leagues: FeaturedLeague[];
  onViewAll?: () => void;
}

const FeaturedLeaguesSection: React.FC<FeaturedLeaguesSectionProps> = ({ leagues, onViewAll }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-star me-2"></i>
          الرابطات المميزة
        </h5>
        {onViewAll && (
          <Button variant="outline-dark" size="sm" onClick={onViewAll}>
            عرض الكل
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {leagues.length > 0 ? (
          <Row>
            {leagues.map(league => (
              <Col md={6} key={league.id} className="mb-3">
                <Card className="h-100 border-warning">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={league.image || '/images/default-league.jpg'}
                        alt={league.titleAr}
                        className="img-fluid rounded me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="mb-1">{league.titleAr}</h6>
                        <Badge bg="warning">{league.highlightAr}</Badge>
                      </div>
                    </div>
                    <p className="small mb-2">{league.descriptionAr}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-trophy fa-3x text-muted mb-3"></i>
            <p className="text-muted">لا توجد رابطات مميزة حالياً</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

interface RecentAchievementsSectionProps {
  achievements: RecentAchievement[];
  onViewAll?: () => void;
}

const RecentAchievementsSection: React.FC<RecentAchievementsSectionProps> = ({ achievements, onViewAll }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-medal me-2"></i>
          الإنجازات الحديثة
        </h5>
        {onViewAll && (
          <Button variant="outline-light" size="sm" onClick={onViewAll}>
            عرض الكل
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {achievements.length > 0 ? (
          <Row>
            {achievements.slice(0, 4).map(achievement => (
              <Col md={3} key={achievement.id} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <h6 className="mb-2">{achievement.athleteNameAr}</h6>
                    <p className="small text-muted mb-2">{achievement.titleAr}</p>
                    <Badge bg="info" className="mb-2">{achievement.achievementTypeAr}</Badge>
                    <p className="small text-muted">
                      {new Date(achievement.achievementDate as any).toLocaleDateString('ar-DZ')}
                    </p>
                    {achievement.clubNameAr && (
                      <p className="small text-primary mb-0">
                        <i className="fas fa-building me-1"></i>
                        {achievement.clubNameAr}
                      </p>
                    )}
                    <div className="mt-3">
                      <Link to={`/achievement/${achievement.id}`} className="btn btn-outline-success btn-sm">
                        اقرأ المزيد
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-award fa-3x text-muted mb-3"></i>
            <p className="text-muted">لا توجد إنجازات حديثة حالياً</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export { NewsSection, FeaturedLeaguesSection, RecentAchievementsSection };
