import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LeaguesService } from '../services/firestoreService';
import type { League } from '../types';

const LeaguesListPage: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesList = await LeaguesService.getAllLeagues();
        setLeagues(leaguesList);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">جاري تحميل البيانات...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-primary" dir="rtl">جميع الرابطات الولائية</h2>
      <Row>
        {leagues.length === 0 ? (
          <Col>
            <div className="text-center text-muted py-5">لا توجد رابطات متاحة حالياً</div>
          </Col>
        ) : (
          leagues.map((league) => (
            <Col md={4} key={league.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <img
                      src={league.image || '/images/default-league.jpg'}
                      alt={league.wilayaNameAr}
                      className="img-fluid rounded-circle"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  </div>
                  <h4 className="mb-2" dir="rtl">رابطة {league.wilayaNameAr} للجودو</h4>
                  <p className="text-muted mb-3">{league.descriptionAr || 'رابطة وطنية للجودو'}</p>
                  <Link 
                    to={`/league/${league.wilayaId}`} 
                    className="btn btn-primary"
                  >
                    تصفح الرابطة
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default LeaguesListPage;
