import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LeaguesService } from '../services/firestoreService';
import { LeagueHomepageService } from '../services/leagueHomepageService';
import type { League } from '../types';
import ImageWithFallback from '../components/shared/ImageWithFallback';

const LeaguesListPage: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [logos, setLogos] = useState<Record<string, string>>({}); // leagueId -> headerLogo

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesList = await LeaguesService.getAllLeagues();
        setLeagues(leaguesList);
        // Fetch homepage header logos (Cloudinary) to prefer over raw league.image
        const entries = await Promise.all(
          leaguesList.map(async (lg) => {
            try {
              // Try by primary id then fallback to wilayaId
              const primary = await LeagueHomepageService.getContent(String(lg.id));
              let headerLogo = (primary as any)?.headerLogo as string | undefined;
              if ((!headerLogo || headerLogo.trim() === '') && lg.wilayaId != null) {
                const alt = await LeagueHomepageService.getContent(String(lg.wilayaId));
                headerLogo = (alt as any)?.headerLogo as string | undefined;
              }
              return [String(lg.id), headerLogo || ''] as const;
            } catch {
              return [String(lg.id), ''] as const;
            }
          })
        );
        const map: Record<string, string> = {};
        entries.forEach(([id, url]) => { if (url) map[id] = url; });
        setLogos(map);
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
                  <div className="mb-3 d-flex justify-content-center">
                    <ImageWithFallback
                      inputSrc={logos[String(league.id)] || league.image}
                      fallbackSrc={'/images/default-league.svg'}
                      alt={league.wilayaNameAr}
                      className="img-fluid rounded-circle shadow-sm"
                      boxWidth={120}
                      boxHeight={120}
                      fixedBox
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
