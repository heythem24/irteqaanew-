import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HomepageService } from '../services/homepageService';
import { ClubsService, UsersService } from '../services/firestoreService';
import type { FeaturedLeague, Club, User } from '../types';

const FeaturedLeaguesListPage: React.FC = () => {
  const [leagues, setLeagues] = useState<FeaturedLeague[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      const content = await HomepageService.getContent();
      setLeagues(content.featuredLeagues || []);
      try {
        const [allClubs, allUsers] = await Promise.all([
          ClubsService.getAllClubs(),
          UsersService.getAllUsers()
        ]);
        setClubs(allClubs);
        setAthletes(allUsers.filter(u => u.role === 'athlete'));
      } catch (e) {
        console.error('فشل في جلب بيانات الإحصائيات', e);
      }
    })();
  }, []);

  const getClubCount = (leagueId: string) => clubs.filter(c => c.leagueId === leagueId).length;
  const getAthleteCount = (leagueId: string) => {
    const leagueClubIds = clubs.filter(c => c.leagueId === leagueId).map(c => c.id);
    return athletes.filter(a => a.clubId && leagueClubIds.includes(a.clubId)).length;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-warning" dir="rtl">جميع الرابطات المميزة</h2>
      <Row>
        {leagues.length === 0 && (
          <Col>
            <div className="text-center text-muted py-5">لا توجد رابطات مميزة حالياً</div>
          </Col>
        )}
        {leagues.map((league) => (
          <Col md={6} key={league.id} className="mb-3">
            <Card className="h-100 border-warning shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={league.image || '/images/default-league.jpg'}
                    alt={league.titleAr}
                    className="img-fluid rounded me-3"
                    style={{ width: '72px', height: '72px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="mb-1" dir="rtl">{league.titleAr}</h5>
                    <Badge bg="warning" text="dark">{league.highlightAr}</Badge>
                  </div>
                </div>
                <p className="small mb-2" dir="rtl">{league.descriptionAr}</p>
                {/* زر زيارة صفحة الرابطة */}
                <div className="d-grid gap-2 mt-2">
                  <Link 
                    to={`/league/${league.wilayaId || league.leagueId}`} 
                    className="btn btn-warning btn-sm"
                  >
                    <i className="fas fa-external-link-alt me-1"></i>
                    زيارة صفحة الرابطة
                  </Link>
                </div>

                {/* صف الإحصائيات */}
                <div className="d-flex justify-content-around text-center mt-3 pt-2 border-top">
                  <div>
                    <div className="text-muted small">
                      <i className="fas fa-shield-alt me-1"></i>
                      الأندية
                    </div>
                    <div className="fw-bold">{getClubCount(league.leagueId)}</div>
                  </div>
                  <div className="vr mx-2"></div>
                  <div>
                    <div className="text-muted small">
                      <i className="fas fa-users me-1"></i>
                      الرياضيين
                    </div>
                    <div className="fw-bold">{getAthleteCount(league.leagueId)}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FeaturedLeaguesListPage;
