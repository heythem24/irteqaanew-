import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ClubsService, UsersService } from '../../../services/firestoreService';
import type { FeaturedLeague, Club, User } from '../../../types';

interface FeaturedLeaguesTabProps {
  leagues: FeaturedLeague[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FeaturedLeaguesTab: React.FC<FeaturedLeaguesTabProps> = ({ leagues, onAdd, onEdit, onDelete }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({...prev, data: true}));
        const [clubsData, usersData] = await Promise.all([
          ClubsService.getAllClubs(),
          UsersService.getAllUsers()
        ]);
        
        setClubs(clubsData);
        // Filter users to get only athletes
        const athletesData = usersData.filter((user: User) => user.role === 'athlete');
        setAthletes(athletesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(prev => ({...prev, data: false}));
      }
    };

    fetchData();
  }, []);

  const getClubCount = (leagueId: string) => {
    if (!leagueId) return 0;
    return clubs.filter(club => club.leagueId === leagueId).length;
  };

  const getAthleteCount = (leagueId: string) => {
    if (!leagueId) return 0;
    const leagueClubs = clubs.filter(club => club.leagueId === leagueId);
    const clubIds = leagueClubs.map(club => club.id);
    return athletes.filter(athlete => athlete.clubId && clubIds.includes(athlete.clubId)).length;
  };
  return (
    <>
      <Row className="mb-3">
        <Col md={8}>
          <h5>الرابطات المميزة</h5>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="warning" onClick={onAdd} className="w-100">
            <i className="fas fa-star me-2"></i>
            إضافة رابطة مميزة
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">الرابطات المميزة ({leagues.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Row className="p-3 pt-0">
            {leagues.map(league => (
              <Col md={6} key={league.id} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={league.image || '/images/default-league.jpg'}
                        alt={league.titleAr}
                        className="img-fluid rounded me-3"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="mb-1">{league.titleAr}</h6>
                        <p className="text-muted small mb-1">{league.title}</p>
                        <Badge bg="warning">{league.highlightAr}</Badge>
                      </div>
                    </div>
                    <p className="small">{league.descriptionAr}</p>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg={league.isActive ? 'success' : 'secondary'} className="me-2">
                        {league.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <div className="d-flex">
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEdit(league.id)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => onDelete(league.id)}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Visit League Button */}
                    <div className="d-grid gap-2 mt-3">
                      <Link 
                        to={`/league/${league.wilayaId || league.leagueId}`} 
                        className="btn btn-warning btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-external-link-alt me-1"></i>
                        زيارة صفحة الرابطة
                      </Link>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="d-flex justify-content-around text-center mt-3 pt-2 border-top">
                      <div>
                        <div className="text-muted small">
                          <i className="fas fa-shield-alt me-1"></i>
                          الأندية
                        </div>
                        <div className="fw-bold">
                          {loading.data ? (
                            <Spinner animation="border" size="sm" role="status">
                              <span className="visually-hidden">جاري التحميل...</span>
                            </Spinner>
                          ) : (
                            getClubCount(league.leagueId)
                          )}
                        </div>
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
          {leagues.length === 0 && (
            <div className="text-center p-4 text-muted">
              <i className="fas fa-trophy fa-3x mb-3"></i>
              <p>لا توجد رابطات مميزة</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default FeaturedLeaguesTab;

